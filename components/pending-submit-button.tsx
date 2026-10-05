"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel: string;
};

export function PendingSubmitButton({ children, disabled, pendingLabel, ...props }: Props) {
  const { pending } = useFormStatus();
  const blocked = disabled || pending;

  return (
    <button
      type="submit"
      disabled={blocked}
      aria-busy={pending || undefined}
      {...props}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
