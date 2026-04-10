import { PageIntro } from "@shared/ui/PageIntro";

export function AccountPage() {
  return (
    <div className="page">
      <PageIntro
        title="Account"
        description="Review your credentials, update profile details, and change the password for this workspace."
      />
      <section className="card">
        <p style={{ margin: 0 }}>Account management will be connected to backend auth next.</p>
      </section>
    </div>
  );
}
