"use client";

import { NetworkCanvas } from "@/components/animations/NetworkCanvas";
import { Typewriter } from "@/components/animations/Typewriter";
import { Reveal } from "@/components/animations/Reveal";
import { Upload, ShieldCheck, AlertTriangle, FileText, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center pt-20 px-4 bg-slate-950 overflow-hidden">
        {/* Animated Background Elements */}
        <NetworkCanvas />
        <div className="perspective-grid"></div>
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
        
        {/* Floating Holographic Icons */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/5 md:left-32 p-4 bg-white/5 border border-cyan-500/30 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(0,255,255,0.2)]"
        >
          <ShieldCheck className="w-12 h-12 text-cyan-400" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/5 md:right-32 p-4 bg-white/5 border border-purple-500/30 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        >
          <Lock className="w-12 h-12 text-purple-400" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/4 right-1/4 p-4 bg-white/5 border border-emerald-500/30 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)] hidden md:block"
        >
          <FileText className="w-10 h-10 text-emerald-400" />
        </motion.div>
        
        <div className="z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8 pointer-events-none mt-10">
          <Reveal width="100%">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">VerifyAI:</span> Digital Trust Copilot
            </h1>
          </Reveal>
          
          <Reveal width="100%" delay={0.2}>
            <div className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto h-20">
              Before you trust it, <span className="text-blue-400 font-semibold">Verify it.</span>
              <br />
              <Typewriter text="The ultimate verification engine to combat digital fraud." delay={800} />
            </div>
          </Reveal>
          
          <Reveal delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-6 pointer-events-auto mt-4">
              <Link href="/verify" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] hover:shadow-[0_0_50px_-5px_rgba(37,99,235,0.8)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group">
                <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                Start Verification
              </Link>
              <Link href="#features" className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-xl font-bold text-lg text-center transition-all">
                How it works
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 bg-background border-t border-white/10 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="max-w-6xl mx-auto space-y-20">
          
          <div className="text-center space-y-4">
            <Reveal width="100%">
              <h2 className="text-4xl font-bold text-white">Zero Hallucination. Total Transparency.</h2>
            </Reveal>
            <Reveal width="100%" delay={0.1}>
              <p className="text-lg text-slate-400">Our multi-agent architecture ensures every claim is backed by extracted evidence.</p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="text-primary w-10 h-10" />}
              title="Job Offers & Certificates"
              desc="Detects fake HR personas, analyzes QR codes, and cross-checks signatures."
              delay={0.2}
            />
            <FeatureCard 
              icon={<AlertTriangle className="text-destructive w-10 h-10" />}
              title="Payment Proofs"
              desc="Scans for edited screenshots, fake fonts, and timestamp mismatches."
              delay={0.3}
            />
            <FeatureCard 
              icon={<Upload className="text-secondary w-10 h-10" />}
              title="News & Legal Docs"
              desc="Verifies contracts, government notices, and flags emotional manipulation."
              delay={0.4}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <Reveal width="100%" delay={delay}>
      <div className="p-8 rounded-2xl bg-glass bg-glass-hover group">
        <div className="mb-4 p-4 bg-white/5 rounded-xl w-fit group-hover:scale-110 transition-transform shadow-inner">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </Reveal>
  );
}
