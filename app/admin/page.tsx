"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getCountFromServer } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

interface Stats {
    projects: number;
    skills: number;
    experiences: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ projects: 0, skills: 0, experiences: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const db = getFirestoreDb();

                const [projectsCount, skillsCount, expCount] = await Promise.all([
                    getCountFromServer(collection(db, "projects")),
                    getCountFromServer(collection(db, "skills")),
                    getCountFromServer(collection(db, "experiences")),
                ]);

                setStats({
                    projects: projectsCount.data().count,
                    skills: skillsCount.data().count,
                    experiences: expCount.data().count,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const statsCards = [
        {
            label: "Projects",
            value: stats.projects,
            href: "/admin/projects",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            color: "from-violet-500 to-indigo-600",
        },
        {
            label: "Skills",
            value: stats.skills,
            href: "/admin/skills",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            color: "from-emerald-500 to-teal-600",
        },
        {
            label: "Experience",
            value: stats.experiences,
            href: "/admin/experience",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            color: "from-amber-500 to-orange-600",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Welcome back! 👋
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                    Here&apos;s an overview of your portfolio content
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {statsCards.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/50 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                                {stat.icon}
                            </div>
                            <svg
                                className="w-5 h-5 text-zinc-400 group-hover:text-violet-600 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {loading ? "-" : stat.value}
                            </p>
                            <p className="text-zinc-600 dark:text-zinc-400">{stat.label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    Quick Actions
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link
                        href="/admin/projects"
                        className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">Add Project</span>
                    </Link>
                    <Link
                        href="/admin/skills"
                        className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">Add Skill</span>
                    </Link>
                    <Link
                        href="/admin/experience"
                        className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">Add Experience</span>
                    </Link>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl p-6 text-white">
                <h2 className="text-lg font-semibold mb-2">Connected to Firebase</h2>
                <p className="text-violet-100">
                    Your portfolio data is now synced with Firebase Firestore. Any changes you make in the admin panel will automatically appear on your public portfolio.
                </p>
            </div>
        </div>
    );
}
