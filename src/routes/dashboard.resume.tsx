import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  UploadCloud,
  CheckCircle2,
  XCircle,
  Download,
  FileText,
  Briefcase,
  FolderKanban,
  KeyRound,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { resumeService } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/resume")({
  component: ResumeAnalyzer,
});

interface ResumeResult {
  atsScore: number;
  skillsFound: string[];
  missingSkills: string[];
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  summary: string;
  experienceFeedback: string;
  projectsFeedback: string;
  keywordFeedback: string;
}

function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze(f: File | null) {
    if (!f) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(f.type)) {
      toast.error("Please upload a PDF or DOCX file.");
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB.");
      return;
    }

    setFile(f);
    setResult(null);
    setLoading(true);

    try {
      const response = await resumeService.analyze(f);

      setResult(response);

      toast.success("Resume analyzed successfully!");
    } catch (error: any) {
      console.error(
        "❌ Resume analysis error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.detail ||
          "Failed to analyze resume."
      );
    } finally {
      setLoading(false);
    }
  }

  async function downloadReport() {
    if (!file) {
      toast.error("Please upload a resume first.");
      return;
    }

    try {
      toast.loading("Generating your report...", {
        id: "resume-report",
      });

      await resumeService.downloadReport(file);

      toast.success("Report downloaded successfully!", {
        id: "resume-report",
      });
    } catch (error: any) {
      console.error(
        "❌ Report download error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.detail ||
          "Failed to download report.",
        {
          id: "resume-report",
        }
      );
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          AI Career Tool
        </div>

        <h1 className="text-2xl font-bold">
          Resume Analyzer
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Upload your resume for an instant ATS score and
          AI-powered feedback.
        </p>
      </div>

      {/* UPLOAD AREA */}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);

          const droppedFile =
            e.dataTransfer.files?.[0];

          if (droppedFile) {
            analyze(droppedFile);
          }
        }}
        className={`glass rounded-3xl p-10 text-center border-2 border-dashed transition ${
          drag
            ? "border-primary bg-primary/5"
            : "border-white/15"
        }`}
      >
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-ai flex items-center justify-center shadow-purple-glow">
          <UploadCloud className="h-7 w-7 text-white" />
        </div>

        <div className="mt-4 font-semibold">
          Drop your resume here
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          PDF or DOCX, up to 5 MB
        </p>

        <label className="mt-4 inline-block">
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={(e) => {
              analyze(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />

          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-primary text-primary-foreground shadow-glow cursor-pointer text-sm">
            Browse files
          </span>
        </label>

        {file && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm glass rounded-full px-3 py-1.5">
            <FileText className="h-4 w-4 text-primary" />
            {file.name}
          </div>
        )}
      </div>

      {/* LOADING */}

      {loading && (
        <div className="glass rounded-3xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            AI is analyzing your resume...
          </div>

          <Progress
            value={65}
            className="mt-4 h-2 bg-white/10"
          />
        </div>
      )}

      {/* RESULTS */}

      {result && !loading && (
        <div className="space-y-6">

          {/* TOP RESULTS */}

          <div className="grid gap-6 md:grid-cols-3">

            {/* ATS SCORE */}

            <div className="glass rounded-3xl p-6">
              <div className="text-sm text-muted-foreground">
                ATS Score
              </div>

              <div className="mt-2 text-5xl font-bold text-gradient-ai">
                {result.atsScore}
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                out of 100
              </div>

              <Progress
                value={result.atsScore}
                className="mt-3 h-2 bg-white/10"
              />

              <Button
                className="mt-6 w-full bg-gradient-primary shadow-glow"
                disabled={loading}
                onClick={downloadReport}
              >
                <Download className="h-4 w-4 mr-1" />
                Download Report
              </Button>
            </div>

            {/* SKILLS FOUND */}

            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Skills found
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {result.skillsFound.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="bg-secondary/20 text-secondary border-secondary/30"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* MISSING SKILLS */}

            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <XCircle className="h-4 w-4 text-destructive" />
                Missing skills
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {result.missingSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="border-destructive/40 text-destructive"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* SUMMARY */}

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Resume Summary
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {result.summary}
            </p>
          </div>

          {/* STRENGTHS + WEAKNESSES */}

          <div className="grid gap-6 md:grid-cols-2">

            {/* STRENGTHS */}

            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Strengths
              </div>

              <ul className="mt-4 space-y-3">
                {result.strengths.map(
                  (strength, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                      {strength}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* WEAKNESSES */}

            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <XCircle className="h-4 w-4 text-destructive" />
                Weaknesses
              </div>

              <ul className="mt-4 space-y-3">
                {result.weaknesses.map(
                  (weakness, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                      {weakness}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* EXPERIENCE */}

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Briefcase className="h-4 w-4 text-primary" />
              Experience Feedback
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {result.experienceFeedback}
            </p>
          </div>

          {/* PROJECTS */}

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FolderKanban className="h-4 w-4 text-primary" />
              Projects Feedback
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {result.projectsFeedback}
            </p>
          </div>

          {/* KEYWORDS */}

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <KeyRound className="h-4 w-4 text-primary" />
              Keyword Feedback
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {result.keywordFeedback}
            </p>
          </div>

          {/* AI SUGGESTIONS */}

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Suggestions
            </div>

            <ul className="mt-4 space-y-3">
              {result.suggestions.map(
                (suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {suggestion}
                  </li>
                )
              )}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}