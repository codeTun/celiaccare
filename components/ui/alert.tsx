import { CircleCheck, CircleExclamationPoint, Info, TriangleExclamationPoint } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "error";

const tones: Record<Tone, { box: string; icon: typeof Info }> = {
  info: { box: "border-sky-200 bg-sky-50 text-sky-900", icon: Info },
  success: { box: "border-brand-200 bg-brand-50 text-brand-900", icon: CircleCheck },
  warning: { box: "border-saffron-100 bg-saffron-50 text-saffron-700", icon: TriangleExclamationPoint },
  error: { box: "border-red-200 bg-red-50 text-red-800", icon: CircleExclamationPoint },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const { box, icon: Icon } = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed", box, className)}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && "mt-0.5")}>{children}</div> : null}
      </div>
    </div>
  );
}
