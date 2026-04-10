import type { ReactNode } from "react";

type AuthFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  panelTitle: string;
  panelBody: string;
  highlights: Array<{
    label: string;
    value: string;
  }>;
  children: ReactNode;
};

export function AuthFrame({
  eyebrow,
  title,
  description,
  panelTitle,
  panelBody,
  highlights,
  children
}: AuthFrameProps) {
  return (
    <div className="auth-shell">
      <section className="auth-hero card">
        <div className="auth-eyebrow">{eyebrow}</div>
        <h1 className="auth-title">{title}</h1>
        <p className="auth-description">{description}</p>
        <div className="auth-highlight-grid">
          {highlights.map((item) => (
            <div key={item.label} className="auth-highlight">
              <div className="auth-highlight-value">{item.value}</div>
              <div className="auth-highlight-label">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="auth-panel">
          <div className="auth-panel-title">{panelTitle}</div>
          <p className="auth-panel-body">{panelBody}</p>
        </div>
      </section>
      <section className="auth-form-column">
        {children}
      </section>
    </div>
  );
}
