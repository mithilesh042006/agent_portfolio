"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Experience {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    type: "work" | "education";
}

export default function AboutPage() {
    const [workExperiences, setWorkExperiences] = useState<Experience[]>([]);
    const [education, setEducation] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchExperiences() {
            try {
                const db = getFirestoreDb();
                const expRef = collection(db, "experiences");
                const q = query(expRef, orderBy("displayOrder"), orderBy("startDate", "desc"));
                const snapshot = await getDocs(q);

                const allExp: Experience[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Experience[];

                setWorkExperiences(allExp.filter((e) => e.type === "work"));
                setEducation(allExp.filter((e) => e.type === "education"));
            } catch (error) {
                console.error("Error fetching experiences:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchExperiences();
    }, []);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "Present";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-block mb-6">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                                M
                            </div>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                            About Me
                        </h1>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                            Full-Stack Developer passionate about building beautiful,
                            functional, and scalable web applications.
                        </p>
                    </div>

                    {/* Bio Section */}
                    <section className="mb-16">
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                                    Professional Summary
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                                    I&apos;m a Full-Stack Developer with over 4 years of experience building web applications.
                                    I specialize in React, Next.js, Node.js, and cloud technologies. I&apos;m passionate about
                                    clean code, modern development practices, and creating exceptional user experiences.
                                </p>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    When I&apos;m not coding, you can find me exploring new technologies, contributing to
                                    open-source projects, or sharing knowledge through technical writing and mentoring.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-10">
                            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Experience Section */}
                    {!loading && (
                        <section className="mb-16">
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 flex items-center gap-3">
                                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Experience
                            </h2>

                            {workExperiences.length === 0 ? (
                                <p className="text-zinc-500 text-center py-6">No work experience added yet.</p>
                            ) : (
                                <div className="space-y-6">
                                    {workExperiences.map((exp) => (
                                        <div
                                            key={exp.id}
                                            className="relative pl-8 pb-6 border-l-2 border-zinc-200 dark:border-zinc-800 last:pb-0"
                                        >
                                            {/* Timeline dot */}
                                            <div className="absolute left-0 top-0 w-4 h-4 -translate-x-[9px] rounded-full bg-violet-600 border-4 border-zinc-50 dark:border-zinc-950" />

                                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                                        {exp.title}
                                                    </h3>
                                                    <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">
                                                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                                                    </span>
                                                </div>
                                                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3">
                                                    {exp.company} • {exp.location}
                                                </p>
                                                <p className="text-zinc-600 dark:text-zinc-400">
                                                    {exp.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Education Section */}
                    {!loading && (
                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 flex items-center gap-3">
                                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                                Education
                            </h2>

                            {education.length === 0 ? (
                                <p className="text-zinc-500 text-center py-6">No education added yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {education.map((edu) => (
                                        <div
                                            key={edu.id}
                                            className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800"
                                        >
                                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                                                {edu.title}
                                            </h3>
                                            <p className="text-zinc-600 dark:text-zinc-400">
                                                {edu.company} • {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                            </p>
                                            {edu.description && (
                                                <p className="text-zinc-500 mt-2">{edu.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
