"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ShieldCheck, AlertTriangle, Info, CheckCircle, FileText, Activity } from "lucide-react";
import { verifyApi } from "@/lib/api";

function ScoreCounter({ score, isHighRisk, isMediumRisk }: { score: number, isHighRisk: boolean, isMediumRisk: boolean }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, Math.round);

    useEffect(() => {
        const animation = animate(count, score, { duration: 1.5, ease: "easeOut" });
        return animation.stop;
    }, [score, count]);

    return (
        <div className={`text-6xl font-black ${isHighRisk ? 'text-red-500' : isMediumRisk ? 'text-yellow-500' : 'text-emerald-500'}`}>
            <motion.span>{rounded}</motion.span><span className="text-2xl text-slate-500">/100</span>
        </div>
    );
}

type Evidence = {
    type: string;
    description: string;
};

type JobData = {
    job_id: string;
    filename: string;
    status: string;
    trust_score: number;
    summary: string;
    recommendation: string;
    evidence: Evidence[];
};

function DashboardContent() {
    const searchParams = useSearchParams();
    const jobId = searchParams.get("job");
    const [data, setData] = useState<JobData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!jobId) {
            setLoading(false);
            return;
        }

        const fetchJob = async () => {
            try {
                const res = await verifyApi.getJobStatus(jobId);
                setData(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId]);

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Activity className="w-8 h-8 animate-spin text-blue-500" /></div>;

    if (!jobId) return <GlobalDashboard />;

    if (!data) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white space-y-4">
            <h1 className="text-3xl font-bold">Job Not Found</h1>
            <p className="text-slate-400">The verification job could not be loaded.</p>
        </div>
    );

    const isHighRisk = data.trust_score < 50;
    const isMediumRisk = data.trust_score >= 50 && data.trust_score < 80;

    return (
        <div className="min-h-screen animated-bg p-6 md:p-12 text-white overflow-hidden relative pt-24">
            {/* Background 3D glowing asset replacement */}
            <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full opacity-40 pointer-events-none z-0 flex items-center justify-center">
                <div className="w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full animate-pulse delay-700 ml-40 mt-40" />
            </div>
            
            <div className="max-w-5xl mx-auto space-y-8 relative z-10">
                
                <header className="flex justify-between items-end border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold">Verification Report</h1>
                        <p className="text-slate-400 mt-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> {data.filename}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold mb-1">Trust Score</p>
                        <ScoreCounter score={data.trust_score} isHighRisk={isHighRisk} isMediumRisk={isMediumRisk} />
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Summary Card */}
                    <div className={`col-span-1 md:col-span-2 bg-glass rounded-2xl p-6 ${isHighRisk ? 'glow-red' : isMediumRisk ? 'glow-yellow' : 'glow-emerald'}`}>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Info className="text-blue-400 w-5 h-5" /> Executive Summary
                        </h2>
                        <p className="text-slate-300 text-lg leading-relaxed">{data.summary}</p>
                        
                        <div className={`mt-6 p-4 rounded-xl border ${isHighRisk ? 'bg-red-950/30 border-red-900/50 text-red-200' : isMediumRisk ? 'bg-yellow-950/30 border-yellow-900/50 text-yellow-200' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-200'}`}>
                            <span className="font-bold uppercase text-xs tracking-wider opacity-70 block mb-1">Recommendation</span>
                            {data.recommendation}
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-glass rounded-2xl p-6 space-y-6">
                        <h2 className="text-xl font-semibold mb-4 text-white">Risk Factors</h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Rule Engine Flags</span>
                                <span className="font-mono text-red-400">{data.evidence.filter(e => e.type === "RED_FLAG" && !e.description.startsWith("[AI]")).length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">AI Anomalies</span>
                                <span className="font-mono text-yellow-400">{data.evidence.filter(e => e.type === "RED_FLAG" && e.description.startsWith("[AI]")).length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Positive Indicators</span>
                                <span className="font-mono text-emerald-400">{data.evidence.filter(e => e.type === "POSITIVE_INDICATOR").length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evidence List */}
                <div className="bg-glass rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-6">Extracted Evidence Log</h2>
                    
                    {data.evidence.length === 0 ? (
                        <p className="text-slate-500 italic">No specific evidence extracted.</p>
                    ) : (
                        <div className="space-y-3">
                            {data.evidence.map((ev, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    key={i} 
                                    className={`p-4 rounded-xl flex gap-4 transition-all hover:scale-[1.01] ${ev.type === 'RED_FLAG' ? 'bg-red-950/40 border border-red-900/50' : ev.type === 'POSITIVE_INDICATOR' ? 'bg-emerald-950/40 border border-emerald-900/50' : 'bg-slate-800/40 border border-slate-700/50'}`}>
                                    <div className="mt-1">
                                        {ev.type === 'RED_FLAG' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : ev.type === 'POSITIVE_INDICATOR' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Info className="w-5 h-5 text-blue-500" />}
                                    </div>
                                    <div>
                                        <p className="text-slate-200 text-sm leading-relaxed">{ev.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Activity className="w-8 h-8 animate-spin text-blue-500" /></div>}>
            <DashboardContent />
        </Suspense>
    );
}

function GlobalDashboard() {
    return (
        <div className="p-8 text-white">
            <header className="mb-10">
                <h1 className="text-3xl font-bold">Your digital trust overview</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                    <h2 className="text-xl font-semibold mb-6">Recent Verifications</h2>
                    <div className="space-y-4">
                        <RecentItem title="Internship Offer Letter" risk="High Risk" score={41} />
                        <RecentItem title="UPI Payment Screenshot" risk="Medium Risk" score={62} />
                        <RecentItem title="Product Screenshot" risk="Low Risk" score={88} />
                    </div>
                </div>
                
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center justify-center min-h-[300px]">
                    <h2 className="text-xl font-semibold mb-6 self-start w-full">Risk Distribution</h2>
                    <div className="w-48 h-48 rounded-full border-[16px] border-slate-800 border-t-red-500 border-r-yellow-500 border-b-emerald-500 border-l-emerald-500 animate-[spin_10s_linear_infinite]" />
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) {
    return (
        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
            <p className="text-sm text-slate-400 mb-2 font-medium uppercase tracking-wider">{label}</p>
            <p className={`text-4xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

function RecentItem({ title, risk, score }: { title: string, risk: string, score: number }) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-white/5">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${score < 50 ? 'bg-red-500/20 text-red-500' : score < 80 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-200">{title}</h3>
                    <p className={`text-sm ${score < 50 ? 'text-red-400' : score < 80 ? 'text-yellow-400' : 'text-emerald-400'}`}>{risk}</p>
                </div>
            </div>
            <div className="text-right">
                <span className={`font-mono text-xl ${score < 50 ? 'text-red-500' : score < 80 ? 'text-yellow-500' : 'text-emerald-500'}`}>{score}</span>
                <span className="text-slate-500 text-sm ml-1">/100</span>
            </div>
        </div>
    );
}
