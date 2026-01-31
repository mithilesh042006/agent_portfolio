"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import SkillBadge from "@/components/SkillBadge";

interface Project {
  id: string;
  title: string;
  description: string;
  technologiesUsed: string[];
  liveDemoUrl?: string;
  repositoryUrl?: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiencyLevel: string;
}

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [previewSkills, setPreviewSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const db = getFirestoreDb();

        // Fetch featured projects (limit to 3)
        const projectsRef = collection(db, "projects");
        const projectsQuery = query(projectsRef, orderBy("displayOrder"), orderBy("title"), limit(3));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData: Project[] = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        setFeaturedProjects(projectsData);

        // Fetch skills for preview (limit to 4)
        const skillsRef = collection(db, "skills");
        const skillsQuery = query(skillsRef, orderBy("displayOrder"), orderBy("name"), limit(4));
        const skillsSnapshot = await getDocs(skillsQuery);
        const skillsData: Skill[] = skillsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Skill[];
        setPreviewSkills(skillsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            {/* Greeting Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
              </span>
              Available for new opportunities
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mb-6">
              Hi, I&apos;m{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Mithilesh
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 mb-4">
              Full-Stack Developer
            </p>

            <p className="text-lg text-zinc-500 dark:text-zinc-500 max-w-2xl mb-8">
              I build beautiful, functional, and scalable web applications. Passionate about clean code,
              modern technologies, and creating exceptional user experiences.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                View My Work
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Featured Projects
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Some of my recent work that I&apos;m proud of
              </p>
            </div>
            <Link
              href="/projects"
              className="hidden sm:inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              View all projects
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
              <p className="text-zinc-500">No projects yet. Add some in the admin panel!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-medium"
            >
              View all projects
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Skills Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Skills & Technologies
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Technologies I work with on a daily basis
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : previewSkills.length === 0 ? (
            <div className="text-center py-12 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl max-w-4xl mx-auto">
              <p className="text-zinc-500">No skills yet. Add some in the admin panel!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {previewSkills.map((skill) => (
                <SkillBadge key={skill.id} {...skill} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/skills"
              className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              See all skills
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Let&apos;s Work Together
          </h2>
          <p className="text-lg text-violet-100 mb-8 max-w-2xl mx-auto">
            Have a project in mind? I&apos;d love to hear about it. Let&apos;s discuss how we can bring your ideas to life.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-violet-700 font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Start a Conversation
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
