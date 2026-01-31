"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

interface SiteSettings {
    profileImageUrl: string;
    name: string;
    title: string;
    bio: string;
}

export default function SettingsAdmin() {
    const [settings, setSettings] = useState<SiteSettings>({
        profileImageUrl: "",
        name: "Mithilesh",
        title: "Full-Stack Developer",
        bio: "I build beautiful, functional, and scalable web applications.",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const db = getFirestoreDb();
                const settingsDoc = await getDoc(doc(db, "settings", "profile"));
                if (settingsDoc.exists()) {
                    setSettings(settingsDoc.data() as SiteSettings);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "portfolio/profile");

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setSettings((prev) => ({ ...prev, profileImageUrl: data.url }));
            } else {
                alert("Failed to upload image");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const db = getFirestoreDb();
            await setDoc(doc(db, "settings", "profile"), settings);
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
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
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Site Settings
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                    Manage your profile and site information
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
                    Profile Settings
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Image */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                            Profile Image
                        </label>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                {settings.profileImageUrl ? (
                                    <img
                                        src={settings.profileImageUrl}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-violet-500/30"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                        <span className="text-4xl text-white font-bold">
                                            {settings.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium cursor-pointer transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {uploading ? "Uploading..." : "Upload Image"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-zinc-500 mt-2">
                                    Recommended: Square image, at least 400x400px
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            value={settings.name}
                            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Title / Role
                        </label>
                        <input
                            type="text"
                            value={settings.title}
                            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    {/* Bio */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Bio
                        </label>
                        <textarea
                            value={settings.bio}
                            onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>
        </div>
    );
}
