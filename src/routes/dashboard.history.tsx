import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  interviewService,
  type InterviewRecord,
} from "@/services/api";

import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Calendar,
  ArrowRight,
  History,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Stores interview IDs which actually have reports
  const [reportsAvailable, setReportsAvailable] = useState<
    Set<number>
  >(new Set());

  // ============================================================
  // LOAD HISTORY
  // ============================================================

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await interviewService.getHistory();

        console.log("📜 History received:", data);

        setItems(data);

        // ======================================================
        // CHECK WHICH INTERVIEWS HAVE REPORTS
        // ======================================================

        const reportChecks = await Promise.all(
          data.map(async (interview) => {
            const interviewId = Number(interview.id);

            try {
              await api.get(`/reports/${interviewId}`);

              console.log(
                `✅ Report exists for Interview ${interviewId}`
              );

              return {
                interviewId,
                available: true,
              };
            } catch (error: any) {
              const status = error?.response?.status;

              if (status === 404) {
                console.log(
                  `ℹ️ No report for Interview ${interviewId}`
                );
              } else {
                console.warn(
                  `⚠️ Could not check report for Interview ${interviewId}:`,
                  error?.response?.data || error
                );
              }

              return {
                interviewId,
                available: false,
              };
            }
          })
        );

        // ======================================================
        // SAVE REPORT IDs
        // ======================================================

        const availableIds = new Set<number>();

        reportChecks.forEach((result) => {
          if (result.available) {
            availableIds.add(result.interviewId);
          }
        });

        console.log(
          "📊 Interviews with reports:",
          [...availableIds]
        );

        setReportsAvailable(availableIds);
      } catch (error: any) {
        console.error(
          "❌ Failed to load history:",
          error?.response?.data || error
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <History className="h-4 w-4" />
            Interview History
          </div>

          <h1 className="mt-1 text-2xl font-bold">
            Interview History
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Every session, one click away.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Loading interview history...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
          <History className="h-4 w-4" />
          Interview History
        </div>

        <h1 className="mt-1 text-2xl font-bold">
          Interview History
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Every session, one click away.
        </p>
      </div>

      {/* ======================================================
          EMPTY
      ====================================================== */}

      {items.length === 0 && (
        <div className="glass rounded-3xl p-10 text-center">
          <History className="mx-auto h-10 w-10 text-muted-foreground" />

          <h2 className="mt-4 text-lg font-semibold">
            No interviews yet
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Start your first mock interview to see it here.
          </p>

          <Button
            asChild
            className="mt-5 bg-gradient-primary shadow-glow"
          >
            <Link to="/dashboard/start-interview">
              Start Interview
            </Link>
          </Button>
        </div>
      )}

      {/* ======================================================
          HISTORY LIST
      ====================================================== */}

      {items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">

          {items.map((r) => {
            const interviewId = Number(r.id);

            const hasReport =
              reportsAvailable.has(interviewId);

            return (
              <div
                key={interviewId}
                className="glass rounded-3xl p-6 hover:shadow-glow transition"
              >

                {/* ==================================================
                    TOP
                ================================================== */}

                <div className="flex items-center justify-between gap-4">

                  <Badge
                    className="
                      bg-primary/20
                      text-primary
                      border-primary/30
                    "
                  >
                    {r.domain}
                  </Badge>

                  <div className="text-right">

                    <div className="text-xs text-muted-foreground">
                      Score
                    </div>

                    <div className="text-3xl font-bold text-gradient-primary">
                      {r.score}
                    </div>

                  </div>
                </div>

                {/* ==================================================
                    DETAILS
                ================================================== */}

                <div className="mt-4 space-y-2">

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">

                    <Calendar className="h-4 w-4" />

                    {r.date}

                  </div>

                  <div className="text-sm text-muted-foreground">

                    Difficulty:{" "}

                    <span className="text-foreground font-medium">
                      {r.difficulty}
                    </span>

                  </div>

                  <div className="text-xs text-muted-foreground">
                    Interview #{interviewId}
                  </div>

                </div>

                {/* ==================================================
                    BUTTONS
                ================================================== */}

                <div className="mt-5 grid grid-cols-2 gap-2">

                  {/* ==================================================
                      OPEN INTERVIEW
                  ================================================== */}

                  <Button
                    asChild
                    variant="outline"
                    className="glass"
                  >
                    <Link
                      to="/dashboard/interview"
                      search={{
                        interviewId: interviewId,
                        domain: r.domain,
                        difficulty: r.difficulty,
                      }}
                    >
                      Open Interview

                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>

                  {/* ==================================================
                      REPORT EXISTS
                  ================================================== */}

                  {hasReport ? (

                    <Button
                      asChild
                      className="bg-gradient-primary shadow-glow"
                    >
                      <Link
                        to="/dashboard/reports"
                        search={{
                          interviewId: interviewId,
                        }}
                      >
                        View Report

                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>

                  ) : (

                    /* ==================================================
                       NO REPORT
                       ================================================== */

                    <Button
                      disabled
                      variant="outline"
                      className="
                        opacity-60
                        cursor-not-allowed
                        flex items-center justify-center gap-2
                      "
                    >
                      <FileText className="h-4 w-4" />

                      Report Not Available
                    </Button>

                  )}

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}