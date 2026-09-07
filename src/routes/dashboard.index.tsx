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

import {
  interviewService,
  authService,
  resumeService,
  type CurrentUser,
  type ReportResponse,
} from "@/services/api";

import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

// ============================================================
// TYPES
// ============================================================

type HistoryItem = Awaited<
  ReturnType<typeof interviewService.getHistory>
>[number];

// ============================================================
// DASHBOARD
// ============================================================

function DashboardHome() {
  const [recent, setRecent] = useState<HistoryItem[]>([]);
  const [user, setUser] = useState<CurrentUser | null>(null);

  const [resumeScore, setResumeScore] = useState<number | null>(null);

  const [communicationScore, setCommunicationScore] = useState<
    number | null
  >(null);

  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const results = await Promise.allSettled([
          interviewService.getHistory(),
          authService.getCurrentUser(),
          resumeService.getLatestAnalysis(),
        ]);

        if (!mounted) {
          return;
        }

        // --------------------------------------------------------
        // HISTORY
        // --------------------------------------------------------

        const historyResult = results[0];

        if (historyResult.status === "fulfilled") {
          setRecent(historyResult.value);
        } else {
          console.error(
            "❌ Failed to load interview history:",
            historyResult.reason
          );

          setRecent([]);
        }

        // --------------------------------------------------------
        // USER
        // --------------------------------------------------------

        const userResult = results[1];

        if (userResult.status === "fulfilled") {
          setUser(userResult.value);
        } else {
          console.error(
            "❌ Failed to load current user:",
            userResult.reason
          );
        }

        // --------------------------------------------------------
        // RESUME
        // --------------------------------------------------------

        const resumeResult = results[2];

        if (resumeResult.status === "fulfilled") {
          const resumeData = resumeResult.value;

          if (
            resumeData.hasResume &&
            resumeData.atsScore !== null &&
            resumeData.atsScore !== undefined
          ) {
            setResumeScore(Number(resumeData.atsScore));
          } else {
            setResumeScore(null);
          }
        } else {
          console.error(
            "❌ Failed to load resume score:",
            resumeResult.reason
          );

          setResumeScore(null);
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "❌ Unexpected dashboard loading error:",
          error
        );

        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // DERIVED STATS
  // ============================================================

  const completedInterviews = recent.filter(
    (interview) => Number(interview.score ?? 0) > 0
  );

  const bestScore =
    completedInterviews.length > 0
      ? Math.max(
          ...completedInterviews.map((interview) =>
            Number(interview.score ?? 0)
          )
        )
      : 0;

  const totalInterviews = recent.length;

  // ============================================================
  // LATEST COMPLETED INTERVIEW
  // ============================================================

  const latestCompletedInterview =
    completedInterviews.length > 0
      ? completedInterviews[0]
      : null;

  // ============================================================
  // LOAD LATEST REPORT FOR COMMUNICATION SCORE
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadLatestReport = async () => {
      if (!latestCompletedInterview) {
        setCommunicationScore(null);
        return;
      }

      try {
        const report: ReportResponse =
          await interviewService.getReport(
            Number(latestCompletedInterview.id)
          );

        if (!mounted) {
          return;
        }

        setCommunicationScore(
          Number(report.communication_score ?? 0)
        );
      } catch (error) {
        console.error(
          "❌ Failed to load latest interview report:",
          error
        );

        if (mounted) {
          setCommunicationScore(null);
        }
      }
    };

    loadLatestReport();

    return () => {
      mounted = false;
    };
  }, [latestCompletedInterview]);

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          WELCOME
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass p-6 sm:p-8"
      >
        <div className="relative z-10">

          <p className="text-sm text-muted-foreground">
            Welcome back,
          </p>

          <h1 className="mt-1 text-3xl sm:text-4xl font-bold">
            {user?.full_name ?? "User"}
          </h1>

          <p className="mt-2 text-muted-foreground">
            Let's keep the momentum going with today's interview.
          </p>

          <Button
            asChild
            className="mt-5 bg-gradient-primary shadow-glow"
          >
            <Link to="/dashboard/start-interview">
              Start Interview

              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

        </div>
      </motion.div>

      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          icon={Trophy}
          label="Best score"
          value={String(bestScore)}
          color="from-primary to-purple"
        />

        <StatCard
          icon={Flame}
          label="Streak"
          value="--"
          color="from-purple to-secondary"
          subtitle="Coming soon"
        />

        <StatCard
          icon={Clock}
          label="Total time"
          value="--"
          color="from-secondary to-primary"
          subtitle="Not tracked"
        />

        <StatCard
          icon={HistoryIcon}
          label="Interviews"
          value={String(totalInterviews)}
          color="from-primary-glow to-purple-glow"
        />

      </div>

      {/* ======================================================
          PERFORMANCE + QUICK ACTIONS
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ====================================================
            PERFORMANCE
        ==================================================== */}

        <div className="glass rounded-3xl p-6 space-y-6">

          {/* BEST INTERVIEW SCORE */}

          <div>

            <div className="flex items-center justify-between text-sm">

              <span className="font-medium">
                Best Interview Score
              </span>

              <span className="text-gradient-primary font-bold">
                {bestScore} / 100
              </span>

            </div>

            <Progress
              value={bestScore}
              className="mt-2 h-2 bg-white/10"
            />

          </div>

          {/* RESUME SCORE */}

          <div>

            <div className="flex items-center justify-between text-sm">

              <span className="font-medium">
                Resume Score
              </span>

              <span
                className={
                  resumeScore !== null
                    ? "text-gradient-primary font-bold"
                    : "text-muted-foreground font-medium"
                }
              >
                {resumeScore !== null
                  ? `${resumeScore} / 100`
                  : "--"}
              </span>

            </div>

            <Progress
              value={resumeScore ?? 0}
              className="mt-2 h-2 bg-white/10"
            />

            <p className="mt-1 text-[11px] text-muted-foreground">
              {resumeScore !== null
                ? "Latest resume analysis score."
                : "Analyze your resume to get a score."}
            </p>

          </div>

          {/* COMMUNICATION */}

          <div>

            <div className="flex items-center justify-between text-sm">

              <span className="font-medium">
                Communication
              </span>

              <span
                className={
                  communicationScore !== null
                    ? "text-gradient-primary font-bold"
                    : "text-muted-foreground font-medium"
                }
              >
                {communicationScore !== null
                  ? `${communicationScore} / 100`
                  : "--"}
              </span>

            </div>

            <Progress
              value={communicationScore ?? 0}
              className="mt-2 h-2 bg-white/10"
            />

            <p className="mt-1 text-[11px] text-muted-foreground">
              {communicationScore !== null
                ? "From your latest interview report."
                : latestCompletedInterview
                ? "Loading latest interview report..."
                : "Complete an interview to see your communication score."}
            </p>

          </div>

          {/* CONFIDENCE */}

          <div>

            <div className="flex items-center justify-between text-sm">

              <span className="font-medium">
                Confidence
              </span>

              <span className="text-muted-foreground font-medium">
                --
              </span>

            </div>

            <Progress
              value={0}
              className="mt-2 h-2 bg-white/10"
            />

            <p className="mt-1 text-[11px] text-muted-foreground">
              Confidence tracking is not available yet.
            </p>

          </div>

        </div>

        {/* ====================================================
            QUICK ACTIONS
        ==================================================== */}

        <div className="glass rounded-3xl p-6 lg:col-span-2">

          <h3 className="font-semibold">
            Quick Actions
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">

            {/* START INTERVIEW */}

            <QuickAction
              to="/dashboard/start-interview"
              icon={Mic}
              title="Start Mock Interview"
              desc="Pick a domain and difficulty."
            />

            {/* RESUME */}

            <QuickAction
              to="/dashboard/resume"
              icon={FileText}
              title="Analyze Resume"
              desc="Get your ATS score in seconds."
            />

            {/* LAST REPORT */}

            {latestCompletedInterview ? (
              <Link
                to="/dashboard/reports"
                search={{
                  interviewId: Number(
                    latestCompletedInterview.id
                  ),
                }}
                className="group"
              >

                <div className="rounded-2xl border border-white/10 p-4 hover:bg-white/5 transition">

                  <div className="flex items-center gap-3">

                    <div className="h-10 w-10 rounded-xl bg-gradient-ai flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>

                    <div>

                      <div className="text-sm font-medium">
                        View Last Report
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Deep-dive into your latest session.
                      </div>

                    </div>

                  </div>

                </div>

              </Link>
            ) : (
              <div className="rounded-2xl border border-white/10 p-4 opacity-60">

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5" />
                  </div>

                  <div>

                    <div className="text-sm font-medium">
                      View Last Report
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Complete an interview first.
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* HISTORY */}

            <QuickAction
              to="/dashboard/history"
              icon={HistoryIcon}
              title="Interview History"
              desc="Review every past attempt."
            />

          </div>

        </div>

      </div>

      {/* ======================================================
          RECENT INTERVIEWS
      ====================================================== */}

      <div className="glass rounded-3xl p-6">

        <div className="flex items-center justify-between">

          <h3 className="font-semibold">
            Recent Interviews
          </h3>

          <Button
            asChild
            variant="ghost"
            size="sm"
          >
            <Link to="/dashboard/history">

              View all

              <ArrowRight className="ml-1 h-4 w-4" />

            </Link>
          </Button>

        </div>

        <div className="mt-4 grid gap-3">

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div className="text-sm text-muted-foreground py-6 text-center">
              Loading recent interviews…
            </div>

          ) : recent.length === 0 ? (

            /* ==================================================
               EMPTY
            ================================================== */

            <div className="text-sm text-muted-foreground py-6 text-center">
              No interviews yet — start your first one above.
            </div>

          ) : (

            /* ==================================================
               INTERVIEW LIST
            ================================================== */

            recent.map((r) => {

              const score = Number(r.score ?? 0);

              const hasReport = score > 0;

              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-white/10 p-4 flex items-center gap-4 hover:bg-white/5 transition"
                >

                  {/* SCORE */}

                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-semibold ${
                      hasReport
                        ? "bg-gradient-ai text-white"
                        : "bg-white/10"
                    }`}
                  >
                    {hasReport ? score : "--"}
                  </div>

                  {/* DETAILS */}

                  <div className="flex-1 min-w-0">

                    <div className="text-sm font-medium truncate">
                      {r.domain}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {r.difficulty} · {r.date}
                    </div>

                  </div>

                  {/* REPORT */}

                  {hasReport ? (

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="glass"
                    >
                      <Link
                        to="/dashboard/reports"
                        search={{
                          interviewId: Number(r.id),
                        }}
                      >
                        Report
                      </Link>
                    </Button>

                  ) : (

                    <span className="text-xs text-muted-foreground px-2">
                      Report Not Available
                    </span>

                  )}

                </div>
              );
            })
          )}

        </div>

      </div>

    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  subtitle,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;

  label: string;

  value: string;

  color: string;

  subtitle?: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-4">

      <div
        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>

      <div>

        <div className="text-xs text-muted-foreground">
          {label}
        </div>

        <div className="text-2xl font-bold">
          {value}
        </div>

        {subtitle && (
          <div className="text-[10px] text-muted-foreground">
            {subtitle}
          </div>
        )}

      </div>

    </div>
  );
}

// ============================================================
// QUICK ACTION
// ============================================================

function QuickAction({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;

  icon: React.ComponentType<{
    className?: string;
  }>;

  title: string;

  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group"
    >
      <div className="rounded-2xl border border-white/10 p-4 hover:bg-white/5 transition">

        <div className="flex items-center gap-3">

          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition">

            <Icon className="h-5 w-5" />

          </div>

          <div>

            <div className="text-sm font-medium">
              {title}
            </div>

            <div className="text-xs text-muted-foreground">
              {desc}
            </div>

          </div>

        </div>

      </div>
    </Link>
  );
}