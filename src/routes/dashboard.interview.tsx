import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Video, Mic, Timer, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { interviewService, type InterviewQuestion } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/interview")({
  component: InterviewScreen,
});

function InterviewScreen() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    interviewService.getQuestions("HR", "Medium").then(setQuestions);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const current = questions[idx];
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Live interview</div>
          <h1 className="text-2xl font-bold">HR · Medium</h1>
        </div>
        <div className="glass rounded-full px-4 py-2 flex items-center gap-2 font-mono">
          <Timer className="h-4 w-4 text-primary" /> {mm}:{ss}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6">
            <div className="text-xs text-muted-foreground">
              Question {idx + 1} of {questions.length}
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-semibold leading-snug">
              {current?.question ?? "Loading question…"}
            </p>
          </div>

          <div className="glass rounded-3xl p-6">
            <label className="text-sm font-medium">Your answer</label>
            <Textarea
              placeholder="Type your answer here, or use the mic to speak…"
              value={answers[idx] ?? ""}
              onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
              className="mt-2 min-h-[220px] bg-white/5 border-white/10 resize-none"
            />
            <div className="mt-4 flex flex-wrap justify-between gap-3">
              <Button
                variant="outline"
                className="glass"
                disabled={idx === 0}
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <div className="flex gap-2">
                {idx < questions.length - 1 ? (
                  <Button
                    className="bg-gradient-primary shadow-glow"
                    onClick={() => setIdx((i) => i + 1)}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    className="bg-gradient-ai shadow-purple-glow"
                    onClick={() => {
                      toast.success("Interview submitted!");
                      navigate({ to: "/dashboard/reports" });
                    }}
                  >
                    Submit Interview <Send className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-3xl p-4">
            <div className="aspect-video rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-ai opacity-10" />
              <Video className="h-10 w-10 text-muted-foreground" />
              <div className="absolute top-2 left-2 glass rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> REC
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground text-center">Webcam preview</div>
          </div>

          <div className="glass rounded-3xl p-6 flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
              <Mic className="h-7 w-7 text-white" />
            </div>
            <div className="mt-3 text-sm font-medium">Microphone</div>
            <div className="text-xs text-muted-foreground">Tap to speak your answer</div>
            <div className="mt-3 flex gap-1 h-6 items-end">
              {[6, 12, 18, 10, 14, 20, 8, 14, 10, 16].map((h, i) => (
                <div
                  key={i}
                  style={{ height: h }}
                  className="w-1 rounded-full bg-gradient-ai animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-5">
            <div className="text-sm font-semibold">Progress</div>
            <div className="mt-2 flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i <= idx ? "bg-gradient-primary" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
