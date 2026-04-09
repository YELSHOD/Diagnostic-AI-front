import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageIntro({ title, description, actions }: Props) {
  return (
    <div className="topbar" style={{ alignItems: "flex-start", gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <p style={{ margin: "8px 0 0", color: "var(--text-muted)", maxWidth: 720 }}>{description}</p>
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
