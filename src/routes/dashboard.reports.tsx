import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  interviewService,
  type ReportResponse,
} from "@/services/api";

// ============================================================
// ROUTE
// ============================================================

export const Route = createFileRoute("/dashboard/reports")({
  validateSearch: (search: Record<string, unknown>) => {
    const rawInterviewId = search.interviewId;

    const interviewId = Number(rawInterviewId);

    return {
      interviewId:
        Number.isFinite(interviewId) && interviewId > 0
          ? interviewId
          : undefined,
    };
  },

  component: ReportsPage,
});

// ============================================================
// TYPES
// ============================================================

interface Interview {
  id: number;
  date: string;
  domain: string;
  difficulty: string;
  score: number;
}

// ============================================================
// REPORTS PAGE
// ============================================================

function ReportsPage() {
  // ==========================================================
  // SEARCH PARAMETER
  // ==========================================================

  const search = Route.useSearch();

  const interviewId = search.interviewId;

  // ==========================================================
  // STATE
  // ==========================================================

  const [report, setReport] =
    useState<ReportResponse | null>(null);

  const [interview, setInterview] =
    useState<Interview | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [resolvedInterviewId, setResolvedInterviewId] =
    useState<number | null>(interviewId ?? null);

  // ==========================================================
  // LOAD REPORT
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadReport = async () => {
      setLoading(true);
      setError("");
      setReport(null);
      setInterview(null);

      try {
        // ====================================================
        // 1. LOAD INTERVIEW HISTORY
        // ====================================================

        console.log(
          "📚 Loading interview history..."
        );

        const history =
          await interviewService.getHistory();

        if (!mounted) {
          return;
        }

        console.log(
          "✅ Interview history:",
          history
        );

        // ====================================================
        // 2. RESOLVE INTERVIEW ID
        // ====================================================

        let targetInterviewId =
          interviewId;

        /*
         * Normally interviewId comes from:
         *
         * /dashboard/reports?interviewId=18
         *
         * If it is missing, recover the latest
         * completed interview from history.
         */

        if (
          !targetInterviewId ||
          !Number.isFinite(targetInterviewId) ||
          targetInterviewId <= 0
        ) {
          console.warn(
            "⚠️ Interview ID missing from URL."
          );

          const latestCompletedInterview =
            history.find(
              (item) =>
                Number(item.score ?? 0) > 0
            );

          if (latestCompletedInterview) {
            targetInterviewId = Number(
              latestCompletedInterview.id
            );

            console.log(
              "✅ Recovered latest completed interview:",
              targetInterviewId
            );
          }
        }

        // ====================================================
        // 3. STILL NO INTERVIEW ID
        // ====================================================

        if (
          !targetInterviewId ||
          !Number.isFinite(targetInterviewId) ||
          targetInterviewId <= 0
        ) {
          throw new Error(
            "No completed interview report is available."
          );
        }

        if (!mounted) {
          return;
        }

        setResolvedInterviewId(
          targetInterviewId
        );

        // ====================================================
        // 4. FIND INTERVIEW DETAILS
        // ====================================================

        const currentInterview =
          history.find(
            (item) =>
              Number(item.id) ===
              Number(targetInterviewId)
          );

        if (currentInterview) {
          const interviewData: Interview = {
            id: Number(currentInterview.id),
            date: currentInterview.date,
            domain: currentInterview.domain,
            difficulty:
              currentInterview.difficulty,
            score: Number(
              currentInterview.score ?? 0
            ),
          };

          setInterview(
            interviewData
          );

          console.log(
            "✅ Matching interview found:",
            interviewData
          );
        } else {
          console.warn(
            "⚠️ Interview details not found in history."
          );
        }

        // ====================================================
        // 5. LOAD REPORT
        // ====================================================

        console.log(
          "📄 Fetching report for interview:",
          targetInterviewId
        );

        const response =
          await interviewService.getReport(
            Number(targetInterviewId)
          );

        if (!mounted) {
          return;
        }

        console.log(
          "✅ Report received:",
          response
        );

        // ====================================================
        // 6. HANDLE DIRECT OR WRAPPED RESPONSE
        // ====================================================

        const responseData =
          response as ReportResponse & {
            report?: ReportResponse;
          };

        const actualReport =
          responseData?.report ??
          responseData;

        // ====================================================
        // 7. VALIDATE REPORT
        // ====================================================

        if (
          !actualReport ||
          typeof actualReport !==
            "object"
        ) {
          throw new Error(
            "Invalid report received from server."
          );
        }

        if (
          !actualReport.id ||
          !actualReport.interview_id
        ) {
          throw new Error(
            "Report data is incomplete."
          );
        }

        // ====================================================
        // 8. SAVE REPORT
        // ====================================================

        setReport(actualReport);

        console.log(
          `✅ Report loaded successfully: Interview ${actualReport.interview_id}, Report ${actualReport.id}`
        );
      } catch (err: any) {
        if (!mounted) {
          return;
        }

        console.error(
          "❌ Failed to load report:",
          err?.response?.data ||
            err
        );

        const backendDetail =
          err?.response?.data?.detail;

        setError(
          backendDetail ||
            err?.message ||
            "Failed to load interview report."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      mounted = false;
    };
  }, [interviewId]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-purple-glow" />

        <h2 className="mt-4 text-xl font-semibold">
          Loading your AI report...
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Loading your interview performance.
        </p>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !report) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />

        <h2 className="mt-4 text-xl font-semibold">
          Unable to load report
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {error ||
            "No report available."}
        </p>

        <p className="mt-3 text-xs text-muted-foreground">
          Interview ID:{" "}
          {resolvedInterviewId ??
            report?.interview_id ??
            "Unknown"}
        </p>
      </div>
    );
  }

  // ==========================================================
  // SAFE SCORE
  // ==========================================================

  const safeScore = (
    value:
      | number
      | null
      | undefined
  ) => {
    const numericValue =
      Number(value);

    if (
      !Number.isFinite(
        numericValue
      )
    ) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(
        100,
        numericValue
      )
    );
  };

  // ==========================================================
  // BACKEND SCORES
  // ==========================================================

  const overallScore =
    safeScore(
      report.overall_score
    );

  const technicalScore =
    safeScore(
      report.technical_score
    );

  const answerQualityScore =
    safeScore(
      report.answer_quality_score
    );

  const problemSolvingScore =
    safeScore(
      report.problem_solving_score
    );

  const communicationScore =
    safeScore(
      report.communication_score
    );

  // ==========================================================
  // RADAR DATA
  // ==========================================================

  const radarData = [
    {
      skill: "Technical",
      value: technicalScore,
    },
    {
      skill: "Answer Quality",
      value: answerQualityScore,
    },
    {
      skill: "Problem Solving",
      value: problemSolvingScore,
    },
    {
      skill: "Communication",
      value: communicationScore,
    },
    {
      skill: "Overall",
      value: overallScore,
    },
  ];

  // ==========================================================
  // QUESTION REPORTS
  // ==========================================================

  const questionReports =
    Array.isArray(
      report.question_reports
    )
      ? [
          ...report.question_reports,
        ].sort(
          (a, b) =>
            a.question_number -
            b.question_number
        )
      : [];

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-glow" />

          <h1 className="text-3xl font-bold">
            Interview Report
          </h1>
        </div>

        <p className="mt-1 text-muted-foreground">
          {interview?.domain ||
            "Interview"}

          {" · "}

          {interview?.difficulty ||
            "Medium"}

          {interview?.date
            ? ` · ${new Date(
                interview.date
              ).toLocaleDateString()}`
            : ""}

          {" · Interview #"}

          {report.interview_id}
        </p>
      </div>

      {/* ====================================================
          SCORE SECTION
      ==================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* OVERALL SCORE */}

        <div className="glass rounded-3xl p-6 lg:col-span-1 text-center flex flex-col justify-center">

          <div className="text-sm text-muted-foreground">
            Overall Score
          </div>

          <div className="mt-1 text-6xl font-bold text-gradient-ai">
            {overallScore}
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            out of 100
          </div>

        </div>

        {/* SCORE BARS */}

        <div className="glass rounded-3xl p-6 lg:col-span-2 space-y-5">

          <ScoreBar
            label="Technical Understanding"
            value={technicalScore}
          />

          <ScoreBar
            label="Answer Quality"
            value={answerQualityScore}
          />

          <ScoreBar
            label="Problem Solving"
            value={problemSolvingScore}
          />

          <ScoreBar
            label="Communication"
            value={communicationScore}
          />

        </div>
      </div>

      {/* ====================================================
          RADAR + SUGGESTIONS
      ==================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* RADAR */}

        <div className="glass rounded-3xl p-6">

          <h3 className="font-semibold">
            Interview Performance
          </h3>

          <p className="text-xs text-muted-foreground mt-1">
            Based on your AI evaluation
          </p>

          <div className="h-72 mt-4">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <RadarChart
                data={radarData}
              >
                <PolarGrid
                  stroke="rgba(255,255,255,0.1)"
                />

                <PolarAngleAxis
                  dataKey="skill"
                  tick={{
                    fill:
                      "rgb(200,200,220)",
                    fontSize: 11,
                  }}
                />

                <PolarRadiusAxis
                  stroke="rgba(255,255,255,0.1)"
                  tick={false}
                  domain={[0, 100]}
                />

                <Radar
                  dataKey="value"
                  stroke="#2563EB"
                  fill="#2563EB"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* AI SUGGESTIONS */}

        <div className="glass rounded-3xl p-6">

          <div className="flex items-center gap-2">

            <Sparkles className="h-4 w-4 text-purple-glow" />

            <h3 className="font-semibold">
              AI Suggestions
            </h3>

          </div>

          <div className="mt-4 text-sm leading-7 text-muted-foreground">
            {report.suggestions ||
              "No suggestions were provided."}
          </div>

        </div>
      </div>

      {/* ====================================================
          STRENGTHS + WEAKNESSES
      ==================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* STRENGTHS */}

        <div className="glass rounded-3xl p-6">

          <div className="flex items-center gap-2">

            <CheckCircle2 className="h-5 w-5" />

            <h3 className="font-semibold text-lg">
              Strengths
            </h3>

          </div>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {report.strengths ||
              "No strengths were provided."}
          </p>

        </div>

        {/* WEAKNESSES */}

        <div className="glass rounded-3xl p-6">

          <div className="flex items-center gap-2">

            <AlertCircle className="h-5 w-5" />

            <h3 className="font-semibold text-lg">
              Areas to Improve
            </h3>

          </div>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {report.weaknesses ||
              "No weaknesses were provided."}
          </p>

        </div>

      </div>

      {/* ====================================================
          QUESTION-WISE PERFORMANCE
      ==================================================== */}

      <div className="glass rounded-3xl p-6">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="font-semibold text-lg">
              Question-wise Performance
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Detailed evaluation of each interview answer
            </p>

          </div>

          <div className="text-sm text-muted-foreground">
            {questionReports.length}/10
          </div>

        </div>

        <div className="mt-5 space-y-4">

          {questionReports.length === 0 ? (

            <div className="text-sm text-muted-foreground">
              No question-wise evaluation is available.
            </div>

          ) : (

            questionReports.map(
              (item) => {

                const questionScore =
                  safeScore(
                    item.score
                  );

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                  >

                    {/* QUESTION HEADER */}

                    <div className="flex flex-wrap items-start justify-between gap-3">

                      <div className="flex-1">

                        <div className="text-xs text-muted-foreground">
                          Question{" "}
                          {item.question_number}
                        </div>

                        <p className="mt-1 font-medium leading-6">
                          {item.question}
                        </p>

                      </div>

                      <div className="shrink-0 text-right">

                        <div className="text-2xl font-bold">
                          {questionScore}
                        </div>

                        <div className="text-[11px] text-muted-foreground">
                          / 100
                        </div>

                      </div>

                    </div>

                    {/* SCORE BAR */}

                    <div className="mt-4">

                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">

                        <div
                          className="h-full bg-gradient-primary rounded-full transition-all"
                          style={{
                            width: `${questionScore}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* REMARK */}

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {item.remark ||
                        "No remark was provided."}
                    </p>

                  </div>
                );
              }
            )

          )}

        </div>
      </div>

      {/* ====================================================
          FINAL FEEDBACK
      ==================================================== */}

      <div className="glass rounded-3xl p-6">

        <div className="flex items-center gap-2">

          <Sparkles className="h-5 w-5 text-purple-glow" />

          <h3 className="font-semibold text-lg">
            Final AI Feedback
          </h3>

        </div>

        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {report.final_feedback ||
            "No final feedback was provided."}
        </p>

      </div>

    </div>
  );
}

// ============================================================
// SCORE BAR
// ============================================================

function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>

      <div className="flex items-center justify-between text-sm">

        <span>{label}</span>

        <span className="font-medium">
          {value} / 100
        </span>

      </div>

      <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">

        <div
          className="h-full bg-gradient-primary rounded-full transition-all"
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
}