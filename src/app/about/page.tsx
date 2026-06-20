import Link from "next/link";
import { Mail, ExternalLink, Brain } from "lucide-react";
import { Github, Linkedin } from "@/components/icons";

export const metadata = {
  title: "About | George Sung",
  description: "Learn more about George Sung, a Machine Learning Engineer exploring the frontiers of AI.",
};

export default function AboutPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        {/* Profile Image & Quick Links Column */}
        <div className="md:col-span-1 flex flex-col items-center text-center">
          <div className="relative group mb-6">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-muted opacity-50 blur transition-all duration-300 group-hover:opacity-75" />
            <img 
              src="/assets/img/profile_photo.png" 
              alt="George Sung" 
              className="relative w-48 h-48 rounded-full object-cover border-4 border-background shadow-lg"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-1">George Sung</h1>
          <p className="text-sm text-muted-foreground mb-6">Machine Learning Engineer</p>

          <div className="flex flex-col gap-2 w-full max-w-[200px]">
            <a 
              href="https://github.com/georgesung" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Github size={16} /> GitHub
              </span>
              <ExternalLink size={14} className="opacity-60" />
            </a>
            
            <a 
              href="https://www.linkedin.com/in/georgesung/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Linkedin size={16} /> LinkedIn
              </span>
              <ExternalLink size={14} className="opacity-60" />
            </a>

            <a 
              href="https://huggingface.co/georgesung" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Brain size={16} /> HuggingFace
              </span>
              <ExternalLink size={14} className="opacity-60" />
            </a>
          </div>
        </div>

        {/* Biography Column */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">About Me</h2>
            <div className="h-1 w-20 bg-primary rounded" />
          </div>

          <div className="prose max-w-none text-muted-foreground space-y-4 text-base md:text-lg leading-relaxed">
            <p>
              Hi! My name is <strong className="text-foreground">George Sung</strong>. I&apos;m a machine learning engineer who is deeply passionate about building AI systems, from the chips they run on to the agents powering them today.
            </p>
            <p>
              My work spans across <strong className="text-foreground">AI agents, generative media, and inference optimization</strong>. Currently, I focus on designing and deploying custom AI agents, building image/video generation workflows, and optimizing model inference cost/latency/quality across hybrid API and self-hosted environments.
            </p>
            <p>
              Before my current focus, I spent years building large-scale personalization and recommendation systems using deep learning, as well as applying reinforcement learning and imitation learning for autonomous vehicle path-planning. I also have a background in semiconductor chip design, working on CPU and GPU SoC-level verification.
            </p>
            <p>
              This blog is where I document my technical experiments, architectural breakdowns, and hands-on learnings. Whether it&apos;s dissecting the inner workings of AI agent frameworks, benchmarking model fine-tuning techniques (like QLoRA), or analyzing LLM traffic patterns, I love diving deep into the code and sharing structured insights.
            </p>
          </div>

          <div className="border-t pt-6 border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Get in Touch</h3>
            <p className="text-sm text-muted-foreground mb-4">
              I&apos;m always open to discussing ML engineering, LLM architectures, and collaboration opportunities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
