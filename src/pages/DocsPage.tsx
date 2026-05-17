import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDefaultIngestProject } from "@entities/project/api";
import { useSettingsStore } from "@features/settings/store";
import { useI18n } from "@shared/i18n/useI18n";
import { PageIntro } from "@shared/ui/PageIntro";

type Guide = {
  id: string;
  title: string;
  subtitle: string;
  whenToUse: string;
  files: Array<{
    name: string;
    code: string;
  }>;
};

function CodeBlock({
  id,
  title,
  children,
  copyLabel,
  copiedLabel
}: {
  id: string;
  title: string;
  children: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="docs-code-wrap">
      <div className="docs-code-title">
        <span>{title}</span>
        <button type="button" className="logs-console-mini-button" onClick={copy}>
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="docs-code" id={id}><code>{children}</code></pre>
    </div>
  );
}

function buildGuides(projectKey: string, ingestUrl: string, t: (path: string) => string): Guide[] {
  return [
    {
      id: "spring-boot",
      title: "Spring Boot",
      subtitle: t("docs.guides.spring.subtitle"),
      whenToUse: t("docs.guides.spring.whenToUse"),
      files: [
        {
          name: ".env or Run Configuration",
          code: `DIAGNOSTIC_PROJECT_KEY=${projectKey}
DIAGNOSTIC_SERVER_URL=${ingestUrl}
DIAGNOSTIC_SERVICE_NAME=my-spring-service
DIAGNOSTIC_ENVIRONMENT=local`
        },
        {
          name: "application.properties",
          code: `diagnostic.project-key=\${DIAGNOSTIC_PROJECT_KEY:}
diagnostic.server-url=\${DIAGNOSTIC_SERVER_URL:http://localhost:8080/api/public/logs}
diagnostic.service-name=\${DIAGNOSTIC_SERVICE_NAME:\${spring.application.name:my-spring-service}}
diagnostic.environment=\${DIAGNOSTIC_ENVIRONMENT:local}`
        },
        {
          name: "src/main/java/com/myapp/observability/DiagnosticAiLogbackAppender.java",
          code: `package com.myapp.observability;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.IThrowableProxy;
import ch.qos.logback.classic.spi.StackTraceElementProxy;
import ch.qos.logback.core.AppenderBase;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

public class DiagnosticAiLogbackAppender extends AppenderBase<ILoggingEvent> {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private HttpClient httpClient;

    private String projectKey;
    private String serverUrl;
    private String serviceName;
    private String environment;

    @Override
    public void start() {
        if (isBlank(projectKey) || isBlank(serverUrl)) {
            addInfo("DiagnosticServiceAI appender disabled: projectKey or serverUrl is empty");
            return;
        }
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofMillis(800))
                .build();
        super.start();
    }

    @Override
    protected void append(ILoggingEvent eventObject) {
        if (!isStarted() || eventObject == null || !eventObject.getLevel().isGreaterOrEqual(Level.ERROR)) {
            return;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("projectKey", projectKey);
        payload.put("serviceName", valueOrDefault(serviceName, "my-spring-service"));
        payload.put("level", eventObject.getLevel().toString());
        payload.put("message", eventObject.getFormattedMessage());
        payload.put("stackTrace", stackTrace(eventObject.getThrowableProxy()));
        payload.put("timestamp", Instant.ofEpochMilli(eventObject.getTimeStamp()).toString());
        payload.put("environment", valueOrDefault(environment, "local"));

        send(payload);
    }

    public void setProjectKey(String projectKey) {
        this.projectKey = projectKey;
    }

    public void setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    private void send(Map<String, Object> payload) {
        try {
            String body = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder(URI.create(serverUrl))
                    .timeout(java.time.Duration.ofMillis(1500))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            httpClient.sendAsync(request, HttpResponse.BodyHandlers.discarding())
                    .orTimeout(1500, TimeUnit.MILLISECONDS)
                    .exceptionally(ex -> null);
        } catch (JsonProcessingException ex) {
            addWarn("Failed to serialize DiagnosticServiceAI log payload", ex);
        } catch (RuntimeException ex) {
            addWarn("Unexpected DiagnosticServiceAI appender error", ex);
        }
    }

    private static String stackTrace(IThrowableProxy throwableProxy) {
        if (throwableProxy == null) {
            return "";
        }

        StringBuilder builder = new StringBuilder();
        appendThrowable(builder, throwableProxy, "");
        return builder.toString();
    }

    private static void appendThrowable(StringBuilder builder, IThrowableProxy throwableProxy, String prefix) {
        builder.append(prefix)
                .append(throwableProxy.getClassName())
                .append(": ")
                .append(Objects.toString(throwableProxy.getMessage(), ""))
                .append('\\n');

        StackTraceElementProxy[] stackTrace = throwableProxy.getStackTraceElementProxyArray();
        if (stackTrace != null) {
            for (StackTraceElementProxy stackTraceElement : stackTrace) {
                builder.append("\\tat ").append(stackTraceElement.getSTEAsString()).append('\\n');
            }
        }

        if (throwableProxy.getCause() != null) {
            appendThrowable(builder, throwableProxy.getCause(), "Caused by: ");
        }
    }

    private static String valueOrDefault(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}`
        },
        {
          name: "logback-spring.xml",
          code: `<configuration>
  <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
  <include resource="org/springframework/boot/logging/logback/console-appender.xml"/>

  <springProperty name="DIAGNOSTIC_PROJECT_KEY" source="diagnostic.project-key" defaultValue=""/>
  <springProperty name="DIAGNOSTIC_SERVER_URL" source="diagnostic.server-url" defaultValue="http://localhost:8080/api/public/logs"/>
  <springProperty name="DIAGNOSTIC_SERVICE_NAME" source="diagnostic.service-name" defaultValue="my-spring-service"/>
  <springProperty name="DIAGNOSTIC_ENVIRONMENT" source="diagnostic.environment" defaultValue="local"/>

  <appender name="DIAGNOSTIC_AI" class="com.myapp.observability.DiagnosticAiLogbackAppender">
    <projectKey>\${DIAGNOSTIC_PROJECT_KEY}</projectKey>
    <serverUrl>\${DIAGNOSTIC_SERVER_URL}</serverUrl>
    <serviceName>\${DIAGNOSTIC_SERVICE_NAME}</serviceName>
    <environment>\${DIAGNOSTIC_ENVIRONMENT}</environment>
  </appender>

  <root level="INFO">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="DIAGNOSTIC_AI"/>
  </root>
</configuration>`
        },
        {
          name: t("docs.guides.spring.howToTest"),
          code: `// ${t("docs.guides.spring.testPlace")}
private static final Logger log = LoggerFactory.getLogger(MyService.class);

try {
    throw new IllegalStateException("DiagnosticServiceAI test error");
} catch (Exception ex) {
    log.error("DiagnosticServiceAI test error from my-spring-service", ex);
}

// ${t("docs.guides.spring.expected")}
// 1. ${t("docs.steps.restart.title")}
// 2. ${t("docs.steps.trigger.title")}
// 3. ${t("docs.steps.runtime.title")}
// 4. ${t("docs.guides.spring.expectedTarget")}
// 5. ${t("docs.steps.logs.title")}`
        }
      ]
    },
    {
      id: "node-js",
      title: "Node.js",
      subtitle: "Express, NestJS, Fastify",
      whenToUse: t("docs.guides.node.whenToUse"),
      files: [
        {
          name: ".env",
          code: `DIAGNOSTIC_PROJECT_KEY=${projectKey}
DIAGNOSTIC_SERVER_URL=${ingestUrl}
DIAGNOSTIC_SERVICE_NAME=my-node-service
DIAGNOSTIC_ENVIRONMENT=local`
        },
        {
          name: "diagnostic-client.ts",
          code: `export async function sendDiagnosticError(error: unknown, message = "Unhandled backend error") {
  if (!process.env.DIAGNOSTIC_PROJECT_KEY || !process.env.DIAGNOSTIC_SERVER_URL) return;

  const err = error instanceof Error ? error : new Error(String(error));
  await fetch(process.env.DIAGNOSTIC_SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectKey: process.env.DIAGNOSTIC_PROJECT_KEY,
      serviceName: process.env.DIAGNOSTIC_SERVICE_NAME ?? "my-node-service",
      level: "ERROR",
      message,
      stackTrace: err.stack ?? "",
      timestamp: new Date().toISOString(),
      environment: process.env.DIAGNOSTIC_ENVIRONMENT ?? "local"
    })
  }).catch(() => undefined);
}`
        },
        {
          name: "Express error middleware",
          code: `app.use((err, req, res, next) => {
  sendDiagnosticError(err, \`\${req.method} \${req.path} failed\`);
  res.status(500).json({ message: "Internal server error" });
});`
        }
      ]
    },
    {
      id: "python",
      title: "Python",
      subtitle: "FastAPI, Django, Flask",
      whenToUse: t("docs.guides.python.whenToUse"),
      files: [
        {
          name: ".env",
          code: `DIAGNOSTIC_PROJECT_KEY=${projectKey}
DIAGNOSTIC_SERVER_URL=${ingestUrl}
DIAGNOSTIC_SERVICE_NAME=my-python-service
DIAGNOSTIC_ENVIRONMENT=local`
        },
        {
          name: "diagnostic_handler.py",
          code: `import logging
import os
import traceback
from datetime import datetime, timezone

import requests

class DiagnosticAIHandler(logging.Handler):
    def emit(self, record):
        if record.levelno < logging.ERROR:
            return
        project_key = os.getenv("DIAGNOSTIC_PROJECT_KEY")
        server_url = os.getenv("DIAGNOSTIC_SERVER_URL")
        if not project_key or not server_url:
            return

        stack = ""
        if record.exc_info:
            stack = "".join(traceback.format_exception(*record.exc_info))

        payload = {
            "projectKey": project_key,
            "serviceName": os.getenv("DIAGNOSTIC_SERVICE_NAME", "my-python-service"),
            "level": "ERROR",
            "message": record.getMessage(),
            "stackTrace": stack,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "environment": os.getenv("DIAGNOSTIC_ENVIRONMENT", "local"),
        }
        try:
            requests.post(server_url, json=payload, timeout=1.5)
        except requests.RequestException:
            pass`
        },
        {
          name: "logging setup",
          code: `logger = logging.getLogger()
logger.addHandler(DiagnosticAIHandler())`
        }
      ]
    },
    {
      id: "dotnet",
      title: ".NET",
      subtitle: "ASP.NET Core",
      whenToUse: t("docs.guides.dotnet.whenToUse"),
      files: [
        {
          name: "appsettings.Development.json",
          code: `{
  "DiagnosticAI": {
    "ProjectKey": "${projectKey}",
    "ServerUrl": "${ingestUrl}",
    "ServiceName": "my-dotnet-service",
    "Environment": "local"
  }
}`
        },
        {
          name: "Minimal middleware",
          code: `app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var exception = feature?.Error;

        if (exception != null)
        {
            var config = context.RequestServices.GetRequiredService<IConfiguration>();
            var client = new HttpClient { Timeout = TimeSpan.FromMilliseconds(1500) };
            _ = client.PostAsJsonAsync(config["DiagnosticAI:ServerUrl"], new
            {
                projectKey = config["DiagnosticAI:ProjectKey"],
                serviceName = config["DiagnosticAI:ServiceName"],
                level = "ERROR",
                message = exception.Message,
                stackTrace = exception.ToString(),
                timestamp = DateTimeOffset.UtcNow,
                environment = config["DiagnosticAI:Environment"] ?? "local"
            });
        }

        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { message = "Internal server error" });
    });
});`
        }
      ]
    },
    {
      id: "raw-http",
      title: "Raw HTTP",
      subtitle: t("docs.guides.raw.subtitle"),
      whenToUse: t("docs.guides.raw.whenToUse"),
      files: [
        {
          name: "POST payload",
          code: `POST ${ingestUrl}
Content-Type: application/json

{
  "projectKey": "${projectKey}",
  "serviceName": "my-service",
  "level": "ERROR",
  "message": "Payment failed",
  "stackTrace": "java.lang.IllegalStateException: Payment failed\\n\\tat com.example.PaymentService.pay(PaymentService.java:42)",
  "timestamp": "2026-05-17T00:00:00Z",
  "environment": "local"
}`
        }
      ]
    }
  ];
}

export function DocsPage() {
  const { t } = useI18n();
  const apiBaseUrl = useSettingsStore((s) => s.apiBaseUrl);
  const project = useDefaultIngestProject();
  const ingestUrl = `${apiBaseUrl.replace(/\/$/, "")}/api/public/logs`;
  const projectKey = project.data?.projectKey ?? "YOUR_DIAGNOSTIC_PROJECT_KEY";
  const guides = useMemo(() => buildGuides(projectKey, ingestUrl, t), [projectKey, ingestUrl, t]);
  const [activeGuideId, setActiveGuideId] = useState("spring-boot");
  const activeGuide = guides.find((guide) => guide.id === activeGuideId) ?? guides[0];

  return (
    <div className="docs-page">
      <PageIntro
        title={t("docs.title")}
        description={t("docs.description")}
        actions={<Link className="button secondary" to="/settings">{t("docs.openSettings")}</Link>}
      />

      <section className="docs-hero card">
        <div>
          <div className="docs-kicker">{t("docs.connectionKicker")}</div>
          <h2>{t("docs.connectionTitle")}</h2>
          <p>
            {t("docs.connectionDescription")}
          </p>
        </div>
        <div className="docs-status-grid">
          <div className="docs-status">
            <span>DIAGNOSTIC_PROJECT_KEY</span>
            <strong>{project.isLoading ? "Loading..." : projectKey}</strong>
          </div>
          <div className="docs-status">
            <span>DIAGNOSTIC_SERVER_URL</span>
            <strong>{ingestUrl}</strong>
          </div>
        </div>
      </section>

      <section className="card docs-card">
        <div className="docs-kicker">{t("docs.chooseLanguage")}</div>
        <div className="docs-language-grid">
          {guides.map((guide) => (
            <button
              key={guide.id}
              type="button"
              className={`docs-language-tab${guide.id === activeGuide.id ? " is-active" : ""}`}
              onClick={() => setActiveGuideId(guide.id)}
            >
              <strong>{guide.title}</strong>
              <span>{guide.subtitle}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card docs-card">
        <div className="docs-kicker">{activeGuide.title}</div>
        <h2>{activeGuide.subtitle}</h2>
        <p>{activeGuide.whenToUse}</p>
        <div className="docs-code-grid">
          {activeGuide.files.map((file, index) => (
            <CodeBlock
              key={`${activeGuide.id}-${file.name}`}
              id={`${activeGuide.id}-${index}`}
              title={file.name}
              copyLabel={t("docs.copy")}
              copiedLabel={t("docs.copied")}
            >
              {file.code}
            </CodeBlock>
          ))}
        </div>
      </section>

      <section className="docs-grid">
        <article className="card docs-card">
          <div className="docs-step">1</div>
          <h3>{t("docs.steps.restart.title")}</h3>
          <p>{t("docs.steps.restart.description")}</p>
        </article>
        <article className="card docs-card">
          <div className="docs-step">2</div>
          <h3>{t("docs.steps.trigger.title")}</h3>
          <p>{t("docs.steps.trigger.description")}</p>
        </article>
        <article className="card docs-card">
          <div className="docs-step">3</div>
          <h3>{t("docs.steps.runtime.title")}</h3>
          <p>{t("docs.steps.runtime.description")}</p>
        </article>
        <article className="card docs-card">
          <div className="docs-step">4</div>
          <h3>{t("docs.steps.logs.title")}</h3>
          <p>{t("docs.steps.logs.description")}</p>
        </article>
      </section>

      <section className="card docs-card">
        <div className="docs-kicker">{t("docs.demo.kicker")}</div>
        <h2>{t("docs.demo.title")}</h2>
        <p>
          {t("docs.demo.description")}
        </p>
        <div className="docs-service-grid">
          {[
            ["ai-chat-kz", t("docs.demo.aiChat")],
            ["restaurant-order-service", t("docs.demo.restaurant")],
            ["delivery-service", t("docs.demo.delivery")]
          ].map(([serviceName, description]) => (
            <div className="docs-service" key={serviceName}>
              <h3>{serviceName}</h3>
              <p>{description}</p>
              <CodeBlock
                id={`demo-${serviceName}`}
                title="service env"
                copyLabel={t("docs.copy")}
                copiedLabel={t("docs.copied")}
              >
                {`DIAGNOSTIC_SERVICE_NAME=${serviceName}`}
              </CodeBlock>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
