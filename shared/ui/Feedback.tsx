import type { ReactNode } from "react";
import { Button } from "./Button";
import styles from "./feedback.module.css";

type FeedbackProps = {
  tone: "error" | "status";
  children: ReactNode;
  action?: { label: string; onClick: () => void; disabled?: boolean; pending?: boolean };
};

export function Feedback({ tone, children, action }: FeedbackProps) {
  return <div className={styles.feedback} data-tone={tone}>
    <p role={tone === "error" ? "alert" : "status"}>{children}</p>
    {action && <Button variant="secondary" onClick={action.onClick} disabled={action.disabled} pending={action.pending}>{action.label}</Button>}
  </div>;
}
