import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { BackgroundPaths } from './background-paths';

// ── Animated number counter ──────────────────────────────────────────────────
function useCounter(to, duration = 1.5, startDelay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const ctrl = animate(0, to, {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94],
        onUpdate: (v) => setValue(Math.floor(v)),
      });
      return ctrl.stop;
    }, startDelay * 1000);
    return () => clearTimeout(t);
  }, [to, duration, startDelay]);
  return value;
}

// ── Stat pill with shimmer + counter ─────────────────────────────────────────
function StatPill({ value, label, delay }) {
  const count = useCounter(value, 1.3, 0.6 + delay);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 + delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center px-4 py-2.5 rounded-xl border border-zinc-800/70 bg-zinc-950/60 backdrop-blur-sm relative overflow-hidden"
    >
      {/* shimmer line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2.5, delay, repeat: Infinity }}
      />
      <span className="text-lg font-black text-white tabular-nums">{count}</span>
      <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mt-0.5 text-center leading-tight">
        {label}
      </span>
    </motion.div>
  );
}

// ── Cycling action word ───────────────────────────────────────────────────────
const WORDS = ['PROCURE', 'ANALYZE', 'APPROVE', 'DISBURSE', 'MONITOR'];

function CyclingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % WORDS.length), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="inline-block min-w-[140px] align-middle">
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="font-black text-violet-400"
      >
        {WORDS[i]}
      </motion.span>
    </span>
  );
}

// ── Letter-by-letter animated title ──────────────────────────────────────────
function AnimatedTitle({ title }) {
  const words = title.split(' ');
  return (
    <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
      {words.map((word, wi) => (
        <span key={wi} className="inline-block mr-3 last:mr-0">
          {word.split('').map((letter, li) => (
            <motion.span
              key={`${wi}-${li}`}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: wi * 0.08 + li * 0.025,
                type: 'spring',
                stiffness: 160,
                damping: 22,
              }}
              className={`inline-block ${
                word === 'VendorBridge' || wi === 1
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-200'
                  : 'text-white'
              }`}
            >
              {letter}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  );
}

// ── Main Hero ────────────────────────────────────────────────────────────────
export default function ProcurementHero({ pipelineCounts = {} }) {
  const {
    rfqs = 12,
    quotes = 38,
    approvals = 5,
    pos = 15,
    paidInvoices = 18,
  } = pipelineCounts;

  return (
    <BackgroundPaths>
      {/* Content */}
      <div className="relative z-10 px-7 py-9 flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16">

        {/* ── Left block ──────────────────────────────────── */}
        <div className="flex-1 space-y-5 min-w-0">

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
            </span>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.22em]">
              Procurement Terminal · Live
            </span>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AnimatedTitle title="Welcome VendorBridge" />
          </motion.div>

          {/* Subtitle cycling word */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex items-baseline gap-2 text-sm text-zinc-400 font-medium"
          >
            <span>System ready to</span>
            <CyclingWord />
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ originX: 0 }}
            className="h-px bg-gradient-to-r from-violet-500/40 via-violet-300/10 to-transparent max-w-xs"
          />

          {/* Stat pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-2"
          >
            <StatPill value={rfqs}         label="Active RFQs"       delay={0}    />
            <StatPill value={quotes}       label="Bids Received"     delay={0.06} />
            <StatPill value={approvals}    label="Pending Approvals" delay={0.12} />
            <StatPill value={pos}          label="POs Dispatched"    delay={0.18} />
            <StatPill value={paidInvoices} label="Invoices Settled"  delay={0.24} />
          </motion.div>
        </div>

        {/* ── Right block — clean type display ────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="shrink-0 hidden lg:flex flex-col items-end gap-3 text-right"
        >
          {[
            { label: 'Procurement Flow', val: 'Active' },
            { label: 'Vendor Sync',      val: 'Live'   },
            { label: 'Audit Log',        val: 'On'     },
          ].map(({ label, val }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-zinc-600 uppercase tracking-widest font-bold">{label}</span>
              <span className="text-xs font-black text-violet-400 bg-violet-500/8 border border-violet-500/20 px-2 py-0.5 rounded-md">
                {val}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </BackgroundPaths>
  );
}
