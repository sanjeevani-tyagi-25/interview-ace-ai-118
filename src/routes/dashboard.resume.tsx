import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCloud, CheckCircle2, XCircle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { resumeService } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/resume")({
  component: ResumeAnalyzer,
});

function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof resumeService.analyze>> | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze(f: File | null) {
    setFile(f);
    if (!f) return;
    setLoading(true);
    const r = await resumeService.analyze(f);
    setResult(r);
    setLoading(false);
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Resume Analyzer</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload your resume for an instant ATS score and rewrite tips.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault(); setDrag(false);
          const f = e.dataTransfer.files?.[0]; if (f) analyze(f);
        }}
        className={`glass rounded-3xl p-10 text-center border-2 border-dashed transition ${
          drag ? "border-primary bg-primary/5" : "border-white/15"
        }`}
      >
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-ai flex items-center justify-center shadow-purple-glow">
          <UploadCloud className="h-7 w-7 text-white" />
        </div>
        <div className="mt-4 font-semibold">Drop your resume here</div>
        <p className="mt-1 text-sm text-muted-foreground">PDF or DOCX, up to 5 MB</p>
        <label className="mt-4 inline-block">
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={(e) => analyze(e.target.files?.[0] ?? null)}
          />
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-primary text-primary-foreground shadow-glow cursor-pointer text-sm">
            Browse files
          </span>
        </label>
        {file && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm glass rounded-full px-3 py-1.5">
            <FileText className="h-4 w-4 text-primary" /> {file.name}
          </div>
        )}
      </div>

      {loading && <div className="text-center text-muted-foreground text-sm">Analyzing…</div>}

      {result && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="glass rounded-3xl p-6 md:col-span-1">
            <div className="text-sm text-muted-foreground">ATS Score</div>
            <div className="mt-2 text-5xl font-bold text-gradient-ai">{result.atsScore}</div>
            <Progress value={result.atsScore} className="mt-3 h-2 bg-white/10" />
            <Button className="mt-6 w-full bg-gradient-primary shadow-glow" onClick={() => toast.success("Report downloaded")}>
              <Download className="h-4 w-4 mr-1" /> Download Report
            </Button>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4 text-secondary" /> Skills found
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.skillsFound.map((s) => (
                <Badge key={s} variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">{s}</Badge>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <XCircle className="h-4 w-4 text-destructive" /> Missing skills
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.missingSkills.map((s) => (
                <Badge key={s} variant="outline" className="border-destructive/40 text-destructive">{s}</Badge>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6 md:col-span-3">
            <div className="text-sm font-semibold">AI suggestions</div>
            <ul className="mt-3 space-y-2">
              {result.suggestions.map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-ai" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
