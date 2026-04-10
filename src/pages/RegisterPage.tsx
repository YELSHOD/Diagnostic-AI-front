import { Link } from "react-router-dom";
import { PageIntro } from "@shared/ui/PageIntro";

export function RegisterPage() {
  return (
    <div className="page auth-page">
      <PageIntro
        title="Register"
        description="Create your operator profile and choose the role you use in the local workspace."
      />
      <section className="card auth-card">
        <label className="field">
          <span>Email</span>
          <input className="input" placeholder="user@example.com" />
        </label>
        <label className="field">
          <span>Username</span>
          <input className="input" placeholder="dev.user" />
        </label>
        <label className="field">
          <span>Password</span>
          <input className="input" type="password" placeholder="••••••••" />
        </label>
        <label className="field">
          <span>Role</span>
          <select className="input" defaultValue="BACKEND">
            <option value="BACKEND">Backend</option>
            <option value="FRONTEND">Frontend</option>
            <option value="DEVOPS">DevOps</option>
            <option value="ANALYST">Analyst</option>
            <option value="QA">QA</option>
          </select>
        </label>
        <button className="button" type="button">Register</button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
