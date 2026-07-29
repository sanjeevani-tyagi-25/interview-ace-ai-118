import { createFileRoute } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard/reports")({
  component: ReportsPage,
});

const data = [
  { skill: "Technical", value: 82 },
  { skill: "Communication", value: 77 },
  { skill: "Confidence", value: 88 },
  { skill: "Problem Solving", value: 74 },
  { skill: "Clarity", value: 85 },
  { skill: "Depth", value: 70 },
];

function ReportsPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Interview Report</h1>
        <p className="mt-1 text-sm text-muted-foreground">HR · Medium · July 22, 2026</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 lg:col-span-1 text-center flex flex-col justify-center">
          <div className="text-sm text-muted-foreground">Overall Score</div>
          <div className="mt-1 text-6xl font-bold text-gradient-ai">82</div>
          <div className="text-xs text-muted-foreground mt-1">out of 100</div>
        </div>

        <div className="glass rounded-3xl p-6 lg:col-span-2 space-y-5">
          <ScoreBar label="Technical" value={82} />
          <ScoreBar label="Communication" value={77} />
          <ScoreBar label="Confidence" value={88} />
          <ScoreBar label="Problem Solving" value={74} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h3 className="font-semibold">Skill radar</h3>
          <div className="h-72 mt-4">
            <ResponsiveContainer>
              <RadarChart data={data}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "rgb(200,200,220)", fontSize: 12 }} />
                <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" tick={false} />
                <Radar dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-glow" />
            <h3 className="font-semibold">AI suggestions</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              "Structure your answers with the STAR framework — situation, task, action, result.",
              "Reduce filler words: you used 'like' 14 times. Aim for pauses instead.",
              "Add a concise close in behavioral answers reinforcing your impact.",
              "Slow down 10% for technical explanations — pacing was 5% faster than ideal.",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-ai" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{value} / 100</span>
      </div>
      <Progress value={value} className="mt-2 h-2 bg-white/10" />
    </div>
  );
}
