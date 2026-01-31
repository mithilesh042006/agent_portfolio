"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SkillBadge from "@/components/SkillBadge";

interface Skill {
    id: string;
    name: string;
    category: string;
    proficiencyLevel: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
    Frontend: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    Backend: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
    ),
    Database: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
    ),
    Tools: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

export default function SkillsPage() {
    const [skillsByCategory, setSkillsByCategory] = useState<Record<string, Skill[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSkills() {
            try {
                const db = getFirestoreDb();
                const skillsRef = collection(db, "skills");
                const q = query(skillsRef, orderBy("displayOrder"), orderBy("name"));
                const snapshot = await getDocs(q);

                const skills: Skill[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Skill[];

                // Group by category
                const grouped: Record<string, Skill[]> = {};
                skills.forEach((skill) => {
                    if (!grouped[skill.category]) {
                        grouped[skill.category] = [];
                    }
                    grouped[skill.category].push(skill);
                });

                setSkillsByCategory(grouped);
            } catch (error) {
                console.error("Error fetching skills:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchSkills();
    }, []);

    const categories = Object.keys(skillsByCategory);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />

            {/* Header */}
            <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6">
                        Skills & <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Technologies</span>
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        A comprehensive overview of the technologies and tools I work with
                    </p>
                </div>
            </section>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!loading && categories.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-zinc-500">No skills to display yet.</p>
                </div>
            )}

            {/* Skills by Category */}
            {!loading && categories.length > 0 && (
                <section className="pb-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto space-y-12">
                        {categories.map((category) => (
                            <div key={category}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                                        {categoryIcons[category] || categoryIcons.Tools}
                                    </div>
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                        {category}
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {skillsByCategory[category].map((skill) => (
                                        <SkillBadge
                                            key={skill.id}
                                            name={skill.name}
                                            proficiencyLevel={skill.proficiencyLevel}
                                            category={skill.category}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
}
