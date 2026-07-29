import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTA } from "@/components/landing/CTA";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — InterviewAI" },
      { name: "description", content: "See how InterviewAI takes you from nervous to hired in four adaptive steps." },
      { property: "og:title", content: "How It Works — InterviewAI" },
      { property: "og:description", content: "From profile to offer, powered by AI feedback at every step." },
    ],
  }),
  component: () => (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24">
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  ),
});
