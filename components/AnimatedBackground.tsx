"use client";

export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-950 to-violet-950/30" />

            {/* Large animated gradient orbs - more visible */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px] animate-blob" />
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
            <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[120px] animate-blob animation-delay-4000" />
            <div className="absolute top-1/2 -right-20 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[80px] animate-blob animation-delay-3000" />

            {/* Floating particles - more visible */}
            <div className="absolute top-[20%] left-[15%] w-3 h-3 bg-violet-400 rounded-full animate-float opacity-60" />
            <div className="absolute top-[30%] right-[20%] w-4 h-4 bg-indigo-400 rounded-full animate-float animation-delay-1000 opacity-50" />
            <div className="absolute bottom-[25%] left-[25%] w-3 h-3 bg-purple-400 rounded-full animate-float animation-delay-2000 opacity-60" />
            <div className="absolute top-[60%] right-[30%] w-5 h-5 bg-violet-300 rounded-full animate-float animation-delay-3000 opacity-40" />
            <div className="absolute top-[45%] left-[10%] w-4 h-4 bg-indigo-300 rounded-full animate-float animation-delay-4000 opacity-50" />
            <div className="absolute bottom-[15%] right-[15%] w-3 h-3 bg-fuchsia-400 rounded-full animate-float animation-delay-1000 opacity-60" />

            {/* Moving gradient line - horizontal */}
            <div className="absolute top-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent animate-slide-x" />
            <div className="absolute top-[60%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent animate-slide-x animation-delay-2000" />

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.3) 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Glowing center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-violet-500/10 via-transparent to-transparent rounded-full animate-pulse-slow" />
        </div>
    );
}
