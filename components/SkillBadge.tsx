interface SkillBadgeProps {
    name: string;
    proficiencyLevel?: "Beginner" | "Intermediate" | "Advanced" | string;
    category?: string;
}

const proficiencyColors: Record<string, { bg: string; text: string; bar: string }> = {
    Beginner: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-400",
        bar: "bg-amber-500",
    },
    Intermediate: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        bar: "bg-blue-500",
    },
    Advanced: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-400",
        bar: "bg-emerald-500",
    },
};

const proficiencyWidth: Record<string, string> = {
    Beginner: "w-1/3",
    Intermediate: "w-2/3",
    Advanced: "w-full",
};

export default function SkillBadge({ name, proficiencyLevel = "Intermediate", category }: SkillBadgeProps) {
    const colors = proficiencyColors[proficiencyLevel] || proficiencyColors.Intermediate;
    const width = proficiencyWidth[proficiencyLevel] || proficiencyWidth.Intermediate;

    return (
        <div className={`group relative px-4 py-3 rounded-xl ${colors.bg} border border-transparent hover:border-${colors.bar.replace('bg-', '')} transition-all duration-200`}>
            <div className="flex items-center justify-between gap-4">
                <span className={`font-medium ${colors.text}`}>{name}</span>
                {proficiencyLevel && (
                    <span className={`text-xs ${colors.text} opacity-80`}>{proficiencyLevel}</span>
                )}
            </div>

            {/* Proficiency Bar */}
            <div className="mt-2 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className={`h-full ${colors.bar} ${width} rounded-full transition-all duration-500 group-hover:opacity-100 opacity-80`} />
            </div>
        </div>
    );
}
