import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Mic,
  FileText,
  History as HistoryIcon,
  Trophy,
  Flame,
  Clock,
} from "lucide-react";
import { interviewService } from "@/services/api";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const [recent, setRecent] = useState<Awaited<ReturnType<typeof interviewService.getHistory>>>([]);
  useEffect(() => {
    interviewService.getHistory().then(setRecent);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass p-6 sm:p-8"
      >
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-purple/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back, <span className="text-gradient-ai">Sanjeevani</span> 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              You're on a 5-day streak. Let's keep it going with today's interview.
            </p>
          </div>
          <Button asChild size="lg" className="bg-gradient-primary shadow-glow">
            <Link to="/dashboard/start-interview">
              Start Interview <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Trophy, label: "Best score", value: "91", color: "from-primary to-purple" },
          { icon: Flame, label: "Streak", value: "5 days", color: "from-purple to-secondary" },
          { icon: Clock, label: "Total time", value: "12h 40m", color: "from-secondary to-primary" },
          { icon: HistoryIcon, label: "Interviews", value: "24", color: "from-primary-glow to-purple-glow" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
              <s.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-2xl font-bold">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scores + Quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-3xl p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Interview Score</span>
              <span className="text-gradient-primary font-bold">82 / 100</span>
            </div>
            <Progress value={82} className="mt-2 h-2 bg-white/10" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Resume Score</span>
              <span className="text-gradient-ai font-bold">84 / 100</span>
            </div>
            <Progress value={84} className="mt-2 h-2 bg-white/10" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Communication</span>
              <span className="font-bold">77 / 100</span>
            </div>
            <Progress value={77} className="mt-2 h-2 bg-white/10" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Confidence</span>
              <span className="font-bold">88 / 100</span>
            </div>
            <Progress value={88} className="mt-2 h-2 bg-white/10" />
          </div>
        </div>

        <div className="glass rounded-3xl p-6 lg:col-span-2">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickAction
              to="/dashboard/start-interview"
              icon={Mic}
              title="Start Mock Interview"
              desc="Pick a domain and difficulty."
            />
            <QuickAction
              to="/dashboard/resume"
              icon={FileText}
              title="Analyze Resume"
              desc="Get your ATS score in seconds."
            />
            <QuickAction
              to="/dashboard/reports"
              icon={Trophy}
              title="View Last Report"
              desc="Deep-dive into your last session."
            />
            <QuickAction
              to="/dashboard/history"
              icon={HistoryIcon}
              title="Interview History"
              desc="Review every past attempt."
            />
          </div>
        </div>
      </div>

      {/* Recent interviews */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent Interviews</h3>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/history">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-3">
          {recent.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/10 p-4 flex items-center gap-4 hover:bg-white/5 transition">
              <div className="h-10 w-10 rounded-xl bg-gradient-ai flex items-center justify-center text-sm font-semibold">
                {r.score}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.domain}</div>
                <div className="text-xs text-muted-foreground">
                  {r.difficulty} · {r.date}
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="glass">
                <Link to="/dashboard/reports">Report</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-white/10 p-4 flex items-start gap-3 hover:bg-white/5 hover:border-primary/40 transition"
    >
      <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:shadow-glow transition">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
    </Link>
  );
}
