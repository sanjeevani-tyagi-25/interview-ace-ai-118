import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Code2,
  Brain,
  Database,
  Layers,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Difficulty, InterviewDomain } from "@/services/api";

export const Route = createFileRoute("/dashboard/start-interview")({
  component: StartInterview,
});

const domains: { id: InterviewDomain; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { id: "HR", icon: Users, desc: "Behavioral & culture-fit questions" },
  { id: "DSA", icon: Code2, desc: "Data structures & algorithms" },
  { id: "Machine Learning", icon: Brain, desc: "Models, math and MLOps" },
  { id: "Data Science", icon: Database, desc: "SQL, stats & case studies" },
  { id: "System Design", icon: Layers, desc: "Scale, tradeoffs & architecture" },
  { id: "Aptitude", icon: Calculator, desc: "Quant, logic & puzzles" },
];

const difficulties: Difficulty[] = ["Easy", "Medium", "Hard"];

function StartInterview() {
  const [domain, setDomain] = useState<InterviewDomain>("HR");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Start a new interview</h1>
        <p className="mt-1 text-muted-foreground text-sm">Pick a domain and difficulty. You can switch mid-way.</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Domain</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => {
            const active = d.id === domain;
            return (
              <motion.button
                key={d.id}
                whileHover={{ y: -4 }}
                onClick={() => setDomain(d.id)}
                className={`text-left rounded-2xl p-5 transition-all border ${
                  active
                    ? "bg-gradient-primary border-transparent shadow-glow"
                    : "glass border-white/10 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${active ? "bg-white/20" : "bg-gradient-ai"}`}>
                    <d.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="font-semibold">{d.id}</div>
                </div>
                <p className={`mt-2 text-xs ${active ? "text-white/80" : "text-muted-foreground"}`}>{d.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Difficulty</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {difficulties.map((d) => {
            const active = d === difficulty;
            return (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`rounded-full px-5 py-2 text-sm transition ${
                  active
                    ? "bg-gradient-primary shadow-glow text-primary-foreground"
                    : "glass hover:bg-white/10"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">Ready when you are</div>
          <div className="mt-1 text-lg font-semibold">
            {domain} · <span className="text-gradient-primary">{difficulty}</span>
          </div>
        </div>
        <Button
          size="lg"
          className="bg-gradient-primary shadow-glow"
          onClick={() => navigate({ to: "/dashboard/interview", search: { domain, difficulty } as any })}
        >
          Start Interview <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
