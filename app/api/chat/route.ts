import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

// Fetch portfolio context from Firestore
async function getPortfolioContext() {
    try {
        const db = getFirestoreDb();

        // Fetch projects
        const projectsRef = collection(db, 'projects');
        const projectsQuery = query(projectsRef, orderBy('displayOrder'), limit(10));
        const projectsSnap = await getDocs(projectsQuery);
        const projects = projectsSnap.docs.map(doc => ({
            title: doc.data().title,
            description: doc.data().description,
            technologies: doc.data().technologiesUsed || [],
            liveDemoUrl: doc.data().liveDemoUrl,
            repositoryUrl: doc.data().repositoryUrl,
        }));

        // Fetch skills
        const skillsRef = collection(db, 'skills');
        const skillsQuery = query(skillsRef, orderBy('displayOrder'), limit(20));
        const skillsSnap = await getDocs(skillsQuery);
        const skills = skillsSnap.docs.map(doc => ({
            name: doc.data().name,
            category: doc.data().category,
            proficiencyLevel: doc.data().proficiencyLevel,
        }));

        // Fetch experiences
        const expRef = collection(db, 'experiences');
        const expQuery = query(expRef, orderBy('displayOrder'), limit(10));
        const expSnap = await getDocs(expQuery);
        const experiences = expSnap.docs.map(doc => ({
            title: doc.data().title,
            company: doc.data().company,
            type: doc.data().type,
            description: doc.data().description,
        }));

        return { projects, skills, experiences };
    } catch (error) {
        console.error('Error fetching portfolio context:', error);
        return { projects: [], skills: [], experiences: [] };
    }
}

const createSystemPrompt = (context: Awaited<ReturnType<typeof getPortfolioContext>>) => {
    return `You are an AI assistant for Mithilesh's portfolio website. You help visitors learn about Mithilesh's skills, projects, and experience. Be friendly, professional, and helpful.

## About Mithilesh
Mithilesh is a skilled developer with expertise in building modern web applications. Here's their current portfolio data:

## Projects (${context.projects.length} total)
${context.projects.map(p => `- **${p.title}**: ${p.description}
  Technologies: ${p.technologies.join(', ')}
  ${p.liveDemoUrl ? `Live: ${p.liveDemoUrl}` : ''}${p.repositoryUrl ? ` | Code: ${p.repositoryUrl}` : ''}`).join('\n\n')}

## Skills
${Object.entries(
        context.skills.reduce((acc, s) => {
            acc[s.category] = acc[s.category] || [];
            acc[s.category].push(`${s.name} (${s.proficiencyLevel})`);
            return acc;
        }, {} as Record<string, string[]>)
    ).map(([category, skills]) => `**${category}**: ${skills.join(', ')}`).join('\n')}

## Experience
${context.experiences.map(e => `- **${e.title}** at ${e.company} (${e.type})
  ${e.description}`).join('\n\n')}

## Guidelines
1. Answer questions about Mithilesh's skills, projects, and experience
2. Be concise but informative
3. If asked about something not in the portfolio, politely say you don't have that information
4. Encourage visitors to explore the portfolio pages for more details
5. If asked for contact, suggest using the Contact form on the website
6. Keep responses under 150 words unless more detail is requested`;
};

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json() as { messages: Message[] };

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        // Get portfolio context
        const context = await getPortfolioContext();
        const systemPrompt = createSystemPrompt(context);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.slice(-10), // Keep last 10 messages for context
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const responseText = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

        return NextResponse.json({
            success: true,
            message: responseText,
        });

    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
            { error: 'Failed to get response' },
            { status: 500 }
        );
    }
}
