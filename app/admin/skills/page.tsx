"use client";

import { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

const categories = ["Frontend", "Backend", "Database", "Tools"];
const proficiencyLevels = ["Beginner", "Intermediate", "Advanced"];

interface Skill {
    id: string;
    name: string;
    category: string;
    proficiencyLevel: string;
    displayOrder: number;
}

const proficiencyColors: Record<string, string> = {
    Beginner: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Advanced: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function SkillsAdmin() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "Frontend",
        proficiencyLevel: "Intermediate",
        displayOrder: 0,
    });

    // Real-time Firestore listener
    useEffect(() => {
        const db = getFirestoreDb();
        const skillsRef = collection(db, "skills");
        const q = query(skillsRef, orderBy("displayOrder"), orderBy("name"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const skillsData: Skill[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Skill[];
            setSkills(skillsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching skills:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredSkills = selectedCategory === "all"
        ? skills
        : skills.filter((s) => s.category === selectedCategory);

    const openAddModal = () => {
        setEditingSkill(null);
        setFormData({ name: "", category: "Frontend", proficiencyLevel: "Intermediate", displayOrder: skills.length + 1 });
        setIsModalOpen(true);
    };

    const openEditModal = (skill: Skill) => {
        setEditingSkill(skill);
        setFormData({
            name: skill.name,
            category: skill.category,
            proficiencyLevel: skill.proficiencyLevel,
            displayOrder: skill.displayOrder || 0,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const db = getFirestoreDb();

            if (editingSkill) {
                // Update existing skill
                const skillRef = doc(db, "skills", editingSkill.id);
                await updateDoc(skillRef, formData);
            } else {
                // Add new skill
                await addDoc(collection(db, "skills"), formData);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving skill:", error);
            alert("Failed to save skill. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this skill?")) {
            try {
                const db = getFirestoreDb();
                await deleteDoc(doc(db, "skills", id));
            } catch (error) {
                console.error("Error deleting skill:", error);
                alert("Failed to delete skill. Please try again.");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Skills</h2>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Manage your skills and technologies ({skills.length} total)
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Skill
                </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
                <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === "all"
                        ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === cat
                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Empty State */}
            {skills.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <svg className="w-12 h-12 mx-auto text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">No skills yet</h3>
                    <p className="mt-2 text-zinc-500">Add your first skill to get started.</p>
                </div>
            )}

            {/* Skills Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map((skill) => (
                    <div
                        key={skill.id}
                        className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between group hover:border-violet-500/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium">
                                {(skill as Skill & { displayOrder?: number }).displayOrder || 0}
                            </span>
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">{skill.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-zinc-500">{skill.category}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${proficiencyColors[skill.proficiencyLevel]}`}>
                                        {skill.proficiencyLevel}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openEditModal(skill)}
                                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleDelete(skill.id)}
                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-500 hover:text-red-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {editingSkill ? "Edit Skill" : "Add Skill"}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Skill Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    placeholder="e.g., React, Python, Docker"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Proficiency Level
                                </label>
                                <div className="flex gap-2">
                                    {proficiencyLevels.map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, proficiencyLevel: level })}
                                            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${formData.proficiencyLevel === level
                                                ? proficiencyColors[level]
                                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Display Order (lower = first)
                                </label>
                                <input
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                    min="0"
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : editingSkill ? "Save Changes" : "Add Skill"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
