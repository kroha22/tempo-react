"use client";

import type { ComponentPropsWithRef } from "react";
import styles from "./button.module.css";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: "primary" | "secondary";
  pending?: boolean;
};

export function Button({ variant = "primary", pending = false, disabled, type = "button", className = "", children, ...props }: ButtonProps) {
  return <button {...props} type={type} disabled={disabled || pending} aria-busy={pending || undefined} className={`${styles.button} ${styles[variant]} ${className}`}>
    {children}
  </button>;
}
