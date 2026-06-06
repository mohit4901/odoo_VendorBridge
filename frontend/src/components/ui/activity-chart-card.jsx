import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const chartVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const barVariants = {
  hidden: { scaleY: 0, opacity: 0, transformOrigin: "bottom" },
  visible: {
    scaleY: 1,
    opacity: 1,
    transformOrigin: "bottom",
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  },
};

/**
 * ActivityChartCard — animated bar chart card.
 *
 * Props:
 *  title          – card heading
 *  totalValue     – large number shown on the left
 *  subtitle       – small text under totalValue (optional)
 *  trend          – e.g. "+12% from last week"
 *  data           – Array<{ day: string, value: number }>
 *  barColor       – tailwind bg class for bars (default: bg-violet-500)
 *  dropdownOptions – array of strings for the range selector
 *  className      – extra wrapper classes
 */
export function ActivityChartCard({
  title = "Activity",
  totalValue,
  subtitle = "",
  trend = "+12% from last period",
  data = [],
  barColor = "bg-violet-500",
  dropdownOptions = ["Weekly", "Monthly", "Quarterly"],
  className = "",
}) {
  const [selectedRange, setSelectedRange] = React.useState(dropdownOptions[0] || "Weekly");

  const maxValue = React.useMemo(
    () => data.reduce((m, d) => (d.value > m ? d.value : m), 0),
    [data]
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-sm p-5 flex flex-col gap-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{title}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-md border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-800/50 cursor-pointer">
              {selectedRange}
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {dropdownOptions.map((opt) => (
              <DropdownMenuItem
                key={opt}
                onSelect={() => setSelectedRange(opt)}
                className={selectedRange === opt ? "text-violet-400" : ""}
              >
                {opt}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Body */}
      <div className="flex items-end gap-5">
        {/* Left — total + trend */}
        <div className="flex flex-col gap-1 shrink-0">
          <span className="text-3xl font-black tracking-tight text-white leading-none">
            {totalValue}
          </span>
          {subtitle && (
            <span className="text-[10px] text-zinc-500 font-semibold">{subtitle}</span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        </div>

        {/* Right — animated bar chart */}
        <motion.div
          key={selectedRange}
          className="flex h-24 flex-1 items-end justify-between gap-1.5"
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          aria-label={`${title} chart`}
        >
          {data.map((item, idx) => {
            const heightPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            return (
              <div
                key={idx}
                className="flex h-full w-full flex-col items-center justify-end gap-1.5"
              >
                <motion.div
                  className={cn("w-full rounded-sm", barColor)}
                  style={{ height: `${heightPct}%`, minHeight: heightPct > 0 ? 3 : 0 }}
                  variants={barVariants}
                  title={`${item.day}: ${item.value}`}
                />
                <span className="text-[9px] text-zinc-600 font-bold">{item.day}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
