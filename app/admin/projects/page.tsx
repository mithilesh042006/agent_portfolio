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

interface Project {
    id: string;
    title: string;
    description: string;
    longDescription?: string;
    technologiesUsed: string[];
    liveDemoUrl?: string;
    repositoryUrl?: string;
    displayOrder: number;
    imageUrl?: string;
    images?: string[];
}

export default function ProjectsAdmin() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        longDescription: "",
        technologies: "",
        liveDemoUrl: "",
        repositoryUrl: "",
        displayOrder: 0,
        imageUrl: "",
        images: [] as string[],
    });
    const [uploading, setUploading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showAiUpload, setShowAiUpload] = useState(false);

    const handleAiGenerate = async (file: File) => {
        if (!file) return;

        const allowedTypes = ['.md', '.txt'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!allowedTypes.includes(fileExt)) {
            alert('Please upload a .md or .txt file');
            return;
        }

        if (file.size > 1024 * 1024) {
            alert('File size must be less than 1MB');
            return;
        }

        setGenerating(true);
        try {
            const documentContent = await file.text();

            const response = await fetch('/api/generate-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentContent }),
            });

            const result = await response.json();

            if (result.success && result.data) {
                setFormData((prev) => ({
                    ...prev,
                    title: result.data.title || prev.title,
                    description: result.data.description || prev.description,
                    technologies: result.data.technologies?.join(', ') || prev.technologies,
                    liveDemoUrl: result.data.liveDemoUrl || prev.liveDemoUrl,
                    repositoryUrl: result.data.repositoryUrl || prev.repositoryUrl,
                }));
                setShowAiUpload(false);
            } else {
                alert(result.error || 'Failed to generate project details');
            }
        } catch (error) {
            console.error('AI generation error:', error);
            alert('Failed to generate project details');
        } finally {
            setGenerating(false);
        }
    };

    // Real-time Firestore listener
    useEffect(() => {
        const db = getFirestoreDb();
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, orderBy("displayOrder"), orderBy("title"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData: Project[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Project[];
            setProjects(projectsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const openAddModal = () => {
        setEditingProject(null);
        setFormData({
            title: "",
            description: "",
            longDescription: "",
            technologies: "",
            liveDemoUrl: "",
            repositoryUrl: "",
            displayOrder: projects.length + 1,
            imageUrl: "",
            images: [],
        });
        setIsModalOpen(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            description: project.description,
            longDescription: project.longDescription || "",
            technologies: project.technologiesUsed.join(", "),
            liveDemoUrl: project.liveDemoUrl || "",
            repositoryUrl: project.repositoryUrl || "",
            displayOrder: project.displayOrder || 0,
            imageUrl: project.imageUrl || "",
            images: project.images || [],
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const projectData = {
            title: formData.title,
            description: formData.description,
            longDescription: formData.longDescription || null,
            technologiesUsed: formData.technologies.split(",").map((t) => t.trim()).filter(Boolean),
            liveDemoUrl: formData.liveDemoUrl || null,
            repositoryUrl: formData.repositoryUrl || null,
            displayOrder: formData.displayOrder,
            imageUrl: formData.imageUrl || null,
            images: formData.images || [],
        };

        try {
            const db = getFirestoreDb();

            if (editingProject) {
                const projectRef = doc(db, "projects", editingProject.id);
                await updateDoc(projectRef, projectData);
            } else {
                await addDoc(collection(db, "projects"), projectData);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving project:", error);
            alert("Failed to save project. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this project?")) {
            try {
                const db = getFirestoreDb();
                await deleteDoc(doc(db, "projects", id));
            } catch (error) {
                console.error("Error deleting project:", error);
                alert("Failed to delete project. Please try again.");
            }
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('folder', 'portfolio/projects');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload,
            });

            const data = await response.json();
            if (data.success) {
                setFormData((prev) => ({ ...prev, imageUrl: data.url }));
            } else {
                alert('Failed to upload image');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Projects</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Manage your portfolio projects ({projects.length} total)
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all text-sm sm:text-base"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Project
                </button>
            </div>

            {/* Empty State */}
            {projects.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <svg className="w-12 h-12 mx-auto text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">No projects yet</h3>
                    <p className="mt-2 text-zinc-500">Add your first project to get started.</p>
                </div>
            )}

            {/* Projects Grid - Mobile Card Layout */}
            {projects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            {/* Project Image */}
                            {project.imageUrl && (
                                <div className="h-32 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                    <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="p-4">
                                {/* Order badge & Title */}
                                <div className="flex items-start gap-3 mb-2">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold flex-shrink-0">
                                        {project.displayOrder || 0}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{project.title}</h3>
                                        <p className="text-sm text-zinc-500 line-clamp-2 mt-1">{project.description}</p>
                                    </div>
                                </div>

                                {/* Technologies */}
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {project.technologiesUsed?.slice(0, 4).map((tech) => (
                                        <span
                                            key={tech}
                                            className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                    {project.technologiesUsed?.length > 4 && (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                            +{project.technologiesUsed.length - 4}
                                        </span>
                                    )}
                                </div>

                                {/* Links & Actions */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex gap-3">
                                        {project.liveDemoUrl && (
                                            <a
                                                href={project.liveDemoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-violet-600 hover:text-violet-700 text-sm font-medium"
                                            >
                                                Demo
                                            </a>
                                        )}
                                        {project.repositoryUrl && (
                                            <a
                                                href={project.repositoryUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm font-medium"
                                            >
                                                Code
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditModal(project)}
                                            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-500 hover:text-red-600 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg border border-zinc-200 dark:border-zinc-800 max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    {editingProject ? "Edit Project" : "Add Project"}
                                </h3>
                                {!editingProject && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAiUpload(!showAiUpload)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showAiUpload
                                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600"
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Generate with AI
                                    </button>
                                )}
                            </div>

                            {/* AI Upload Section */}
                            {showAiUpload && !editingProject && (
                                <div className="mt-4">
                                    <label className={`flex flex-col items-center justify-center w-full py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${generating
                                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                                        : "border-zinc-300 dark:border-zinc-700 hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-900/10"
                                        }`}>
                                        {generating ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-2" />
                                                <span className="text-sm text-violet-600 font-medium">Analyzing document...</span>
                                                <span className="text-xs text-zinc-500 mt-1">AI is extracting project details</span>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-violet-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Upload PRD.md or README.md</span>
                                                <span className="text-xs text-zinc-500 mt-1">.md or .txt files up to 1MB</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept=".md,.txt"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleAiGenerate(file);
                                            }}
                                            disabled={generating}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Technologies (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.technologies}
                                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                                    placeholder="React, Node.js, PostgreSQL"
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                        Live Demo URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.liveDemoUrl}
                                        onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                        Repository URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.repositoryUrl}
                                        onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
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
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Project Image
                                </label>
                                {formData.imageUrl ? (
                                    <div className="relative">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Project preview"
                                            className="w-full h-40 object-cover rounded-xl border border-zinc-300 dark:border-zinc-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, imageUrl: "" })}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading
                                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                                        : "border-zinc-300 dark:border-zinc-700 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10"
                                        }`}>
                                        {uploading ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-2" />
                                                <span className="text-sm text-violet-600">Uploading...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-zinc-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm text-zinc-500">Click to upload main image</span>
                                                <span className="text-xs text-zinc-400 mt-1">PNG, JPG up to 10MB</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Additional Images */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Additional Images (Gallery)
                                </label>

                                {/* Existing images grid */}
                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={img}
                                                    alt={`Gallery ${idx + 1}`}
                                                    className="w-full h-20 object-cover rounded-lg border border-zinc-300 dark:border-zinc-700"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = formData.images.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, images: newImages });
                                                    }}
                                                    className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add more images */}
                                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-6 h-6 text-zinc-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-xs text-zinc-500">Add more images</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            try {
                                                const uploadForm = new FormData();
                                                uploadForm.append('file', file);
                                                uploadForm.append('folder', 'portfolio/projects');

                                                const response = await fetch('/api/upload', {
                                                    method: 'POST',
                                                    body: uploadForm,
                                                });

                                                const data = await response.json();
                                                if (data.success) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        images: [...prev.images, data.url],
                                                    }));
                                                } else {
                                                    alert('Failed to upload image');
                                                }
                                            } catch (error) {
                                                console.error('Upload error:', error);
                                                alert('Failed to upload image');
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Long Description */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Detailed Description (shown on project page)
                                </label>
                                <textarea
                                    value={formData.longDescription}
                                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                                    rows={5}
                                    placeholder="Add a detailed description of the project, including challenges, solutions, features, and learnings..."
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
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
                                    {saving ? "Saving..." : editingProject ? "Save Changes" : "Add Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
