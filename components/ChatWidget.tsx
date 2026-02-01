"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

// Format message content - parse markdown, make links clickable, handle newlines
function formatMessage(content: string): React.ReactNode {
    // Split by newlines first
    const lines = content.split('\n');

    const processLine = (line: string, lineIndex: number): React.ReactNode => {
        const parts: React.ReactNode[] = [];

        // Combined regex for URLs and bold text
        const regex = /(https?:\/\/[^\s]+)|\*\*([^*]+)\*\*/g;
        let lastIndex = 0;
        let match;
        let keyIndex = 0;

        while ((match = regex.exec(line)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                parts.push(line.slice(lastIndex, match.index));
            }

            if (match[1]) {
                // URL match
                parts.push(
                    <a
                        key={`${lineIndex}-${keyIndex++}`}
                        href={match[1]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 dark:text-violet-400 underline hover:text-violet-800 dark:hover:text-violet-300 break-all"
                    >
                        {match[1]}
                    </a>
                );
            } else if (match[2]) {
                // Bold text match - render as styled span without asterisks
                parts.push(
                    <span key={`${lineIndex}-${keyIndex++}`} className="font-semibold">
                        {match[2]}
                    </span>
                );
            }

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < line.length) {
            parts.push(line.slice(lastIndex));
        }

        return parts.length > 0 ? parts : line;
    };

    return (
        <>
            {lines.map((line, index) => (
                <span key={index}>
                    {processLine(line, index)}
                    {index < lines.length - 1 && <br />}
                </span>
            ))}
        </>
    );
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Add initial greeting when chat opens for the first time
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    role: "assistant",
                    content: "Hi! 👋 I'm Mithilesh's AI assistant. I can tell you about their projects, skills, and experience. What would you like to know?",
                },
            ]);
        }
    }, [isOpen, messages.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: "user", content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: data.message },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." },
                ]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, something went wrong. Please try again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full shadow-lg transition-all duration-300 ${isOpen
                    ? "bg-zinc-800 dark:bg-zinc-700 p-4"
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-xl hover:shadow-violet-500/30 p-4 hover:pr-5"
                    }`}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <>
                        <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="max-w-0 overflow-hidden whitespace-nowrap text-white text-sm font-medium transition-all duration-300 group-hover:max-w-xs group-hover:pr-1">
                            Chat with Mithilesh&apos;s AI
                        </span>
                    </>
                )}
            </button>

            {/* Full Screen Chat Window */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden w-full max-w-3xl h-[85vh] animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="px-6 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">AI Assistant</h3>
                                    <p className="text-sm text-white/70">Ask me about Mithilesh&apos;s work, projects, and skills</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[75%] px-5 py-3 rounded-2xl text-base leading-relaxed ${msg.role === "user"
                                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-md"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-md"
                                            }`}
                                    >
                                        {formatMessage(msg.content)}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-100 dark:bg-zinc-800 px-5 py-4 rounded-2xl rounded-bl-md">
                                        <div className="flex gap-1.5">
                                            <span className="w-2.5 h-2.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2.5 h-2.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2.5 h-2.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-5 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about projects, skills, experience..."
                                    disabled={loading}
                                    className="flex-1 px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
