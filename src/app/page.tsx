'use client';

import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, Clock, Sparkles, MoveRight, Layers, Smartphone, Star, PlayCircle, X, ChevronRight, Zap, Shield, Users } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 ring-1 ring-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-10 bg-black/50 p-2 rounded-full backdrop-blur-md"
              >
                <X size={20} />
              </button>
              <div className="w-full h-full flex items-center justify-center text-white flex-col gap-6 bg-gradient-to-br from-zinc-900 to-black">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <PlayCircle size={80} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={1} />
                </div>
                <p className="font-mono text-sm text-zinc-500 uppercase tracking-widest">Demo Video Placeholder</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500 opacity-10 blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#0A0A0B]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl text-white relative z-10 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                  <Sparkles size={18} className="text-white/90" />
                </div>
              </div>
              <span className="font-bold text-2xl tracking-tighter text-white group-hover:text-indigo-300 transition-colors">UniFlow</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Workflow</a>
              <Link
                href="/app"
                className="bg-white text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden z-10 selection:bg-indigo-500/30">
        <div className="max-w-7xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner mb-8 hover:bg-white/10 transition-colors cursor-default backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">v2.0 Logic Engine Live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-medium text-white mb-8 tracking-tighter leading-[1] md:leading-[0.9]"
          >
            Master Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 drop-shadow-2xl">
              Academic Time.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Stop fighting with spreadsheets. UniFlow's intelligent engine resolves conflicts, optimizes gaps, and builds your perfect semester in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-500 transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.6)] hover:-translate-y-1 flex items-center justify-center gap-2 group border border-indigo-500/50"
            >
              Start Scheduling
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => setShowVideo(true)}
              className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white border border-zinc-800 rounded-xl font-semibold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 hover:border-zinc-700"
            >
              <PlayCircle size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* 3D-ish Hero/Interface Mockup */}
        <motion.div
          initial={{ opacity: 0, rotateX: 20, y: 100 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.2 }}
          className="mt-24 relative mx-auto max-w-6xl z-10 perspective-1000"
          style={{ perspective: "1000px" }}
        >
          <div className="relative rounded-t-2xl bg-[#0A0A0B] p-2 ring-1 ring-white/10 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm border-t border-l border-r border-white/10 overflow-hidden">

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-20"></div>

            {/* Mock App Header */}
            <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-black/40">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <div className="ml-4 h-6 w-64 rounded bg-white/5"></div>
            </div>

            {/* Mock App Content */}
            <div className="flex h-[500px] bg-[#0A0A0B]">
              <div className="w-64 border-r border-white/5 p-4 hidden md:block bg-black/20">
                <div className="h-8 w-32 bg-indigo-500/20 rounded mb-6 animate-pulse"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-full bg-white/5 rounded border border-white/5"></div>)}
                </div>
              </div>
              <div className="flex-1 p-6 relative overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20">
                <div className="grid grid-cols-4 gap-4 h-full">
                  {[1, 2, 3, 4].map(col => (
                    <div key={col} className="border-r border-white/5 last:border-0 relative">
                      {col === 2 && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 100, opacity: 1 }}
                          transition={{ delay: 1.2, duration: 0.8 }}
                          className="absolute left-1 right-1 h-32 bg-indigo-600/20 border border-indigo-500/50 rounded-lg p-3 backdrop-blur-md"
                        >
                          <div className="h-2 w-12 bg-indigo-400 rounded mb-2"></div>
                          <div className="h-3 w-24 bg-white/20 rounded"></div>
                        </motion.div>
                      )}
                      {/* Add faint lines */}
                      {[1, 2, 3, 4, 5].map(row => (
                        <div key={row} className="absolute w-full border-b border-white/5" style={{ top: `${row * 20}%` }}></div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Enhanced Cursor Animation */}
                <motion.div
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ x: [100, 250, 250], y: [50, 150, 150], opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 3, repeatDelay: 1, ease: "easeInOut" }}
                  className="absolute z-50 pointer-events-none"
                >
                  <div className="relative">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg filter">
                      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
                    </svg>
                    <div className="absolute top-6 left-4 bg-indigo-600/90 text-[10px] font-bold px-2 py-0.5 rounded text-white backdrop-blur-md whitespace-nowrap">
                      Drag to Schedule
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          {/* Bottom Fade */}
          <div className="absolute -bottom-1 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0B] to-transparent z-30"></div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 relative z-10 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 mb-6">Built for the Modern Student</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">University scheduling hasn't changed in 20 years. We fixed it.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap size={24} className="text-indigo-400" />}
              title="Conflict Resolution"
              desc="Our engine detects overlaps instantly. No more double-booking yourself for Calculus and Chemistry."
            />
            <FeatureCard
              icon={<Layers size={24} className="text-violet-400" />}
              title="Smart Tetris View"
              desc="Overlapping classes automatically resize and stack side-by-side, giving you a clear view of your busy days."
            />
            <FeatureCard
              icon={<Shield size={24} className="text-emerald-400" />}
              title="Privacy First"
              desc="Your data stays local. We use browser storage so your schedule is yours and yours alone."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 relative overflow-hidden" ref={targetRef}>
        {/* Decorative Background */}
        <motion.div style={{ opacity, scale }} className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-indigo-500 font-bold tracking-wider uppercase text-xs mb-4 block">Workflow</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">From Chaos to <br />Clarity in 3 Steps</h2>
              <p className="text-lg text-zinc-400 mb-8">Stop writing CRN numbers on sticky notes. UniFlow gives you a visual canvas for your semester.</p>

              <div className="space-y-8">
                <StepItem number="01" title="Select Courses" desc="Browse the catalog and add your required classes to the bench." />
                <StepItem number="02" title="Drag & Drop" desc="Move them onto the grid. Watch them snap into place perfectly." />
                <StepItem number="03" title="Auto-Fill Gaps" desc="Use the 'Add Study Block' button to smartly fill free time." />
              </div>
            </div>

            {/* Abstract Visual for Workflow */}
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-zinc-900 border border-white/10 relative overflow-hidden p-8 flex flex-col justify-between group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-[#1A1A1C] p-4 rounded-xl border border-white/10 shadow-xl w-3/4 self-end z-10"
                >
                  <div className="h-2 w-16 bg-zinc-700 rounded mb-2"></div>
                  <div className="h-2 w-full bg-zinc-800 rounded"></div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="bg-indigo-600/20 p-4 rounded-xl border border-indigo-500/30 shadow-xl w-3/4 backdrop-blur-md z-20"
                >
                  <div className="h-2 w-20 bg-indigo-400/50 rounded mb-2"></div>
                  <div className="h-2 w-full bg-indigo-500/20 rounded"></div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="bg-[#1A1A1C] p-4 rounded-xl border border-white/10 shadow-xl w-2/3 self-center z-10"
                >
                  <div className="h-2 w-12 bg-zinc-700 rounded mb-2"></div>
                  <div className="h-2 w-full bg-zinc-800 rounded"></div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 border-t border-white/5 relative bg-[#0A0A0B]">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Calendar size={40} className="text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to optimize your semester?</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto">Join the new standard for university scheduling. Fast, private, and beautifully designed.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-xl font-bold text-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group"
            >
              Launch Application
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <p className="mt-8 text-sm text-zinc-600">No sign-up required for basic use. Data stored locally.</p>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors duration-300 group">
      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}

function StepItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6">
      <div className="text-2xl font-mono font-bold text-white/20 pt-1 select-none">{number}</div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 leading-relaxed text-sm">{desc}</p>
      </div>
    </div>
  )
}
