import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LocaleSwitcher } from "@features/settings/LocaleSwitcher";
import { ThemeToggle } from "@features/settings/ThemeToggle";
import { useI18n } from "@shared/i18n/useI18n";

type AuthLandingProps = {
  mode: "login" | "register" | "account";
  eyebrow: string;
  title: string;
  description: string;
  supportingTitle: string;
  supportingPoints: string[];
  children: ReactNode;
};

export function AuthLanding({
  mode,
  eyebrow,
  title,
  description,
  supportingTitle,
  supportingPoints,
  children
}: AuthLandingProps) {
  const { t } = useI18n();

  return (
    <div className="auth-landing">
      <header className="auth-landing-header">
        <Link className="auth-brand" to="/login">
          <span className="auth-brand-mark">Diagnostic AI</span>
          <span className="auth-brand-copy">{t("auth.brandCopy")}</span>
        </Link>
        <div className="auth-landing-actions">
          <nav className="auth-landing-nav" aria-label="Authentication pages">
            <Link className={`auth-nav-link${mode === "login" ? " active" : ""}`} to="/login">
              {t("auth.navLogin")}
            </Link>
            <Link className={`auth-nav-link${mode === "register" ? " active" : ""}`} to="/register">
              {t("auth.navRegister")}
            </Link>
            {mode === "account" ? (
              <Link className="auth-nav-link active" to="/account">
                {t("auth.navAccount")}
              </Link>
            ) : null}
          </nav>
          <div className="auth-landing-tools">
            <LocaleSwitcher compact />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="auth-landing-main">
        <section className="auth-landing-copy">
          <div className="auth-landing-eyebrow">{eyebrow}</div>
          <h1 className="auth-landing-title">{title}</h1>
          <p className="auth-landing-description">{description}</p>

          <div className="auth-landing-support">
            <div className="auth-landing-support-title">{supportingTitle}</div>
            <ul className="auth-landing-points">
              {supportingPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="auth-landing-form">{children}</section>
      </main>

      <footer className="auth-landing-footer">
        <div className="auth-landing-footer-mark">Diagnostic AI</div>
        <div className="auth-landing-footer-copy">
          <span>{t("auth.footerLead")}</span>
          <span>{t("auth.footerMeta")}</span>
        </div>
      </footer>
    </div>
  );
}
