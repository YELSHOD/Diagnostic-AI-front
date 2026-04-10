import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LocaleSwitcher } from "@features/settings/LocaleSwitcher";
import { ThemeToggle } from "@features/settings/ThemeToggle";

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
  return (
    <div className="auth-landing">
      <header className="auth-landing-header">
        <Link className="auth-brand" to="/login">
          <span className="auth-brand-mark">Diagnostic AI</span>
          <span className="auth-brand-copy">Local observability workspace</span>
        </Link>
        <div className="auth-landing-actions">
          <nav className="auth-landing-nav" aria-label="Authentication pages">
            <Link className={`auth-nav-link${mode === "login" ? " active" : ""}`} to="/login">
              Login
            </Link>
            <Link className={`auth-nav-link${mode === "register" ? " active" : ""}`} to="/register">
              Register
            </Link>
            {mode === "account" ? (
              <Link className="auth-nav-link active" to="/account">
                Account
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
    </div>
  );
}
