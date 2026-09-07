import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — InterviewAI" },
      { name: "description", content: "Explore mock AI interviewer, resume AI, voice AI, coding rounds, detailed reports and feedback." },
      { property: "og:title", content: "Features — InterviewAI" },
      { property: "og:description", content: "A complete AI interview studio — from resume to offer letter." },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32">
        <div className="mx-auto max-w-3xl text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Built to <span className="text-gradient-ai">get you hired</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Every tool you need to prepare, practice and perform — powered by AI.
          </p>
        </div>
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
