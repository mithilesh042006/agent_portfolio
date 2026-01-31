"use client";

import { useState, useEffect } from "react";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    updateDoc,
    Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: Timestamp;
    read: boolean;
}

export default function MessagesAdmin() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    // Real-time Firestore listener
    useEffect(() => {
        const db = getFirestoreDb();
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData: Message[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Message[];
            setMessages(messagesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleMarkAsRead = async (id: string, currentStatus: boolean) => {
        try {
            const db = getFirestoreDb();
            const messageRef = doc(db, "messages", id);
            await updateDoc(messageRef, { read: !currentStatus });
        } catch (error) {
            console.error("Error updating message:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this message?")) {
            try {
                const db = getFirestoreDb();
                await deleteDoc(doc(db, "messages", id));
                if (selectedMessage?.id === id) {
                    setSelectedMessage(null);
                }
            } catch (error) {
                console.error("Error deleting message:", error);
                alert("Failed to delete message. Please try again.");
            }
        }
    };

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return "Unknown";
        const date = timestamp.toDate();
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const unreadCount = messages.filter((m) => !m.read).length;

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
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Messages</h2>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        {messages.length} total messages
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                                {unreadCount} unread
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Empty State */}
            {messages.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <svg className="w-12 h-12 mx-auto text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">No messages yet</h3>
                    <p className="mt-2 text-zinc-500">Messages from the contact form will appear here.</p>
                </div>
            )}

            {/* Messages Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Message List */}
                <div className="space-y-3">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            onClick={() => {
                                setSelectedMessage(msg);
                                if (!msg.read) {
                                    handleMarkAsRead(msg.id, false);
                                }
                            }}
                            className={`bg-white dark:bg-zinc-900 rounded-xl p-4 border cursor-pointer transition-all group ${selectedMessage?.id === msg.id
                                    ? "border-violet-500 ring-2 ring-violet-500/20"
                                    : "border-zinc-200 dark:border-zinc-800 hover:border-violet-500/50"
                                } ${!msg.read ? "bg-violet-50/50 dark:bg-violet-900/10" : ""}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {!msg.read && (
                                            <span className="w-2 h-2 rounded-full bg-violet-600" />
                                        )}
                                        <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                            {msg.name}
                                        </p>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                                        {msg.subject}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {formatDate(msg.createdAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(msg.id);
                                    }}
                                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-500 hover:text-red-600 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Detail */}
                {selectedMessage ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 h-fit sticky top-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    {selectedMessage.subject}
                                </h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {formatDate(selectedMessage.createdAt)}
                                </p>
                            </div>
                            <button
                                onClick={() => handleMarkAsRead(selectedMessage.id, selectedMessage.read)}
                                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${selectedMessage.read
                                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600"
                                        : "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                    }`}
                            >
                                {selectedMessage.read ? "Mark as unread" : "Mark as read"}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                    <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">From</p>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{selectedMessage.name}</p>
                                    <a
                                        href={`mailto:${selectedMessage.email}`}
                                        className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
                                    >
                                        {selectedMessage.email}
                                    </a>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-zinc-500 mb-2">Message</p>
                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                    <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                        {selectedMessage.message}
                                    </p>
                                </div>
                            </div>

                            <a
                                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9-6 9 6-9 6-9-6z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8" />
                                </svg>
                                Reply via Email
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="hidden lg:flex items-center justify-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12">
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto text-zinc-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-zinc-500">Select a message to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
