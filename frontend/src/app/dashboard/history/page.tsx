"use client";

import { useState, useEffect } from "react";
import { FileText, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
    // In a real app, this would be fetched from the backend (e.g., /api/verify/history)
    const [history, setHistory] = useState([
        { id: "1", filename: "Internship Offer Letter", date: "May 25, 2025", score: 41, status: "High Risk" },
        { id: "2", filename: "UPI Payment Screenshot", date: "May 24, 2025", score: 62, status: "Medium Risk" },
        { id: "3", filename: "Product Screenshot", date: "May 20, 2025", score: 88, status: "Low Risk" },
        { id: "4", filename: "Amazon Invoice", date: "May 15, 2025", score: 95, status: "Safe" },
    ]);

    return (
        <div className="p-8 text-white min-h-screen">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">Verification History</h1>
                    <p className="text-slate-400 mt-2">View all your past verifications and their trust scores.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search files..." 
                            className="bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button className="bg-slate-900 border border-slate-700 p-2 rounded-lg hover:bg-slate-800">
                        <Filter className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </header>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950 border-b border-white/10 text-slate-400 text-sm">
                            <th className="p-4 font-semibold">Document Name</th>
                            <th className="p-4 font-semibold">Date Analyzed</th>
                            <th className="p-4 font-semibold text-center">Trust Score</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item) => (
                            <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="font-medium">{item.filename}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-400 text-sm">{item.date}</td>
                                <td className="p-4 text-center font-mono font-semibold">{item.score}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        item.score < 50 ? 'bg-red-500/20 text-red-400' :
                                        item.score < 80 ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <Link 
                                        href={`/dashboard?job=${item.id}`} 
                                        className="text-sm text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        View Report
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
