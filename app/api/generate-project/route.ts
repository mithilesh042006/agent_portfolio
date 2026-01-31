import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';

const SYSTEM_PROMPT = `You are an AI assistant that extracts project information from documentation files to create portfolio-ready project entries.

Your task is to analyze the provided document content and extract/generate the following fields:
- title: A concise, professional project title
- description: A 2-3 sentence portfolio-ready description highlighting what the project does and its key value
- technologies: An array of technologies/frameworks/tools used in the project
- liveDemoUrl: The live demo URL if mentioned (or empty string if not found)
- repositoryUrl: The GitHub/repository URL if mentioned (or empty string if not found)

RULES:
1. Use ONLY information found in the document - do not invent or hallucinate
2. If a field cannot be determined, leave it empty or use an empty array
3. Keep the description professional, concise, and portfolio-friendly
4. Extract ALL technologies mentioned (programming languages, frameworks, databases, tools, etc.)
5. Return ONLY valid JSON, no markdown or explanations

Respond with this exact JSON structure:
{
  "title": "string",
  "description": "string", 
  "technologies": ["string"],
  "liveDemoUrl": "string",
  "repositoryUrl": "string"
}`;

export async function POST(request: NextRequest) {
    try {
        const { documentContent } = await request.json();

        if (!documentContent || typeof documentContent !== 'string') {
            return NextResponse.json(
                { error: 'Document content is required' },
                { status: 400 }
            );
        }

        if (documentContent.length > 50000) {
            return NextResponse.json(
                { error: 'Document is too large. Maximum 50,000 characters.' },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Analyze this project documentation and extract the project details:\n\n${documentContent}` }
            ],
            temperature: 0.3,
            max_tokens: 1000,
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content;

        if (!responseText) {
            return NextResponse.json(
                { error: 'AI did not return a response' },
                { status: 500 }
            );
        }

        const projectData = JSON.parse(responseText);

        // Validate the response structure
        const result = {
            title: projectData.title || '',
            description: projectData.description || '',
            technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [],
            liveDemoUrl: projectData.liveDemoUrl || '',
            repositoryUrl: projectData.repositoryUrl || '',
        };

        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error('AI Generation error:', error);

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Failed to parse AI response' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to generate project details' },
            { status: 500 }
        );
    }
}
