import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Github, Linkedin } from "@/components/icons";

export const metadata = {
  title: "About | George Sung",
  description: "Learn more about George Sung.",
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
          <p className="text-sm text-muted-foreground mb-6">AI, AI, and more AI...</p>

          <div className="flex flex-col gap-2 w-full max-w-[200px]">
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
              href="https://huggingface.co/georgesung"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="text-[16px] leading-none select-none" aria-hidden="true">🤗</span> HuggingFace
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
              Hi! My name is <strong className="text-foreground">Jou-ching (George) Sung</strong>. I love learning and tinkering with all things AI -- from AI agents, to AI model training and serving, to AI chips.
            </p>
            <p>
              My professional background spans AI agents, LLM post-training, LLM/image-gen/TTS model inference optimization, large-scale ML recommender systems, reinforcement learning for autonomous driving, and semiconductor chip design. A bit all over the place, but certainly very fun! And hopefully useful ;)
            </p>
          </div>

          {/* Professional Experience Timeline */}
          <div className="space-y-6 pt-2">
            <div className="relative pl-6 border-l-2 border-border">
              <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary" />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                <h4 className="text-lg font-bold text-foreground">GAZAI (generative media AI startup)</h4>
                <span className="text-sm font-semibold text-primary">2025+</span>
              </div>
              <p className="text-base text-muted-foreground">
                AI agents, LLM post-training, AI model inference optimization
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-border">
              <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                <h4 className="text-lg font-bold text-foreground">Amazon</h4>
                <span className="text-sm font-semibold text-muted-foreground">2020 – 2024</span>
              </div>
              <p className="text-base text-muted-foreground">
                Machine learning for large scale recommender systems
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-border">
              <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                <h4 className="text-lg font-bold text-foreground">BMW</h4>
                <span className="text-sm font-semibold text-muted-foreground">2017 – 2020</span>
              </div>
              <p className="text-base text-muted-foreground">
                Reinforcement learning and deep learning for autonomous driving
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-border">
              <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                <h4 className="text-lg font-bold text-foreground">AMD</h4>
                <span className="text-sm font-semibold text-muted-foreground">2009 – 2016</span>
              </div>
              <p className="text-base text-muted-foreground">
                Semiconductor chip design
              </p>
            </div>
          </div>

          <div className="border-t pt-6 border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">More</h3>
            <p className="text-sm text-muted-foreground mb-4">
              For more about me, feel free to check out my <a href="https://www.linkedin.com/in/georgesung/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>, <a href="https://github.com/georgesung" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub</a>, and/or <a href="https://huggingface.co/georgesung" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">HuggingFace</a>.
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
