import * as React from "react";
import { cva } from "class-variance-authority";
import {
  RiArrowDownLine,
  RiArrowDownSFill,
  RiArrowRightLine,
  RiArrowRightSFill,
  RiArrowUpLine,
  RiArrowUpSFill,
} from "@remixicon/react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const badgeDeltaVariants = cva(
  "inline-flex items-center font-semibold text-[11px]",
  {
    variants: {
      variant: {
        outline: "gap-x-1 rounded-md px-2 py-0.5 ring-1 ring-inset ring-zinc-700/60",
        solid:   "gap-x-1 rounded-md px-2 py-0.5",
        solidOutline: "gap-x-1 rounded-md px-2 py-0.5 ring-1 ring-inset",
        complex: "space-x-2 rounded-lg bg-zinc-900 py-1 pl-2.5 pr-1 ring-1 ring-inset ring-zinc-800",
      },
      deltaType: {
        increase: "",
        decrease: "",
        neutral:  "",
      },
    },
    compoundVariants: [
      // outline
      { deltaType: "increase", variant: "outline", className: "text-emerald-400" },
      { deltaType: "decrease", variant: "outline", className: "text-red-400"     },
      { deltaType: "neutral",  variant: "outline", className: "text-zinc-400"    },
      // solid
      { deltaType: "increase", variant: "solid", className: "bg-emerald-950/60 text-emerald-400" },
      { deltaType: "decrease", variant: "solid", className: "bg-red-950/60 text-red-400"         },
      { deltaType: "neutral",  variant: "solid", className: "bg-zinc-800/60 text-zinc-400"       },
      // solidOutline
      { deltaType: "increase", variant: "solidOutline", className: "bg-emerald-950/60 text-emerald-400 ring-emerald-700/30" },
      { deltaType: "decrease", variant: "solidOutline", className: "bg-red-950/60 text-red-400 ring-red-700/30"            },
      { deltaType: "neutral",  variant: "solidOutline", className: "bg-zinc-800/40 text-zinc-400 ring-zinc-700/40"         },
    ],
  }
);

const ICONS = {
  increase: { filled: RiArrowUpSFill,    line: RiArrowUpLine    },
  decrease: { filled: RiArrowDownSFill,  line: RiArrowDownLine  },
  neutral:  { filled: RiArrowRightSFill, line: RiArrowRightLine },
};

function DeltaIcon({ deltaType = "neutral", iconStyle = "filled" }) {
  const Icon = ICONS[deltaType][iconStyle];
  return <Icon className="-ml-0.5 size-3.5" aria-hidden />;
}

/**
 * BadgeDelta — dark-theme delta badge using @remixicon/react arrows.
 *
 * Props:
 *  value       – string | number shown in the badge
 *  deltaType   – "increase" | "decrease" | "neutral"  (default: "neutral")
 *  variant     – "outline" | "solid" | "solidOutline" | "complex"  (default: "outline")
 *  iconStyle   – "filled" | "line"  (default: "filled")
 *  className   – extra classes
 */
export function BadgeDelta({
  className,
  variant = "outline",
  deltaType = "neutral",
  iconStyle = "filled",
  value,
  ...props
}) {
  if (variant === "complex") {
    const textColor =
      deltaType === "increase" ? "text-emerald-400" :
      deltaType === "decrease" ? "text-red-400"     : "text-zinc-400";
    const iconBg =
      deltaType === "increase" ? "bg-emerald-950/70" :
      deltaType === "decrease" ? "bg-red-950/70"     : "bg-zinc-800/50";

    return (
      <span className={cn(badgeDeltaVariants({ variant }), className)} {...props}>
        <span className={cn("text-[11px] font-semibold", textColor)}>{value}</span>
        <span className={cn("rounded-md px-1.5 py-0.5", iconBg)}>
          <DeltaIcon deltaType={deltaType} iconStyle="line" />
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(badgeDeltaVariants({ variant, deltaType }), className)}
      {...props}
    >
      <DeltaIcon deltaType={deltaType} iconStyle={iconStyle} />
      {value}
    </span>
  );
}
