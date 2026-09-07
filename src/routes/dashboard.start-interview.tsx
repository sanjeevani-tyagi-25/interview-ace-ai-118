import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
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
import {
  interviewService,
  type Difficulty,
  type InterviewDomain,
} from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/dashboard/start-interview"
)({
  component: StartInterview,
});

const domains: {
  id: InterviewDomain;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}[] = [
  {
    id: "HR",
    icon: Users,
    desc: "Behavioral & culture-fit questions",
  },
  {
    id: "DSA",
    icon: Code2,
    desc: "Data structures & algorithms",
  },
  {
    id: "Machine Learning",
    icon: Brain,
    desc: "Models, math and MLOps",
  },
  {
    id: "Data Science",
    icon: Database,
    desc: "SQL, statistics & case studies",
  },
  {
    id: "System Design",
    icon: Layers,
    desc: "Architecture & scalability",
  },
  {
    id: "Aptitude",
    icon: Calculator,
    desc: "Quantitative aptitude",
  },
];

const difficulties: Difficulty[] = [
  "Easy",
  "Medium",
  "Hard",
];

function StartInterview() {
  const navigate = useNavigate();

  const [domain, setDomain] =
    useState<InterviewDomain>("HR");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Medium");

  const [loading, setLoading] =
    useState(false);

  const startInterview = async () => {
    try {
      setLoading(true);

      console.log("🚀 Starting interview...");
      console.log("Domain:", domain);
      console.log("Difficulty:", difficulty);

      const interview =
        await interviewService.startInterview(
          domain,
          difficulty
        );

      console.log(
        "🔥 FULL INTERVIEW RESPONSE:",
        interview
      );

      console.log(
        "🔥 INTERVIEW ID:",
        interview?.id
      );

      // Make sure backend returned an ID
      if (!interview?.id) {
        toast.error("Interview ID is missing");

        console.error(
          "❌ Backend response does not contain interview ID:",
          interview
        );

        return;
      }

      toast.success(
        "Interview Created Successfully!"
      );

      // IMPORTANT:
      // Backend returns "id", NOT "interview_id"
      navigate({
        to: "/dashboard/interview",
        search: {
          interviewId: interview.id,
          domain,
          difficulty,
        } as any,
      });

    } catch (error: any) {
      console.error(
        "❌ Failed to start interview:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.detail ||
        "Failed to start interview"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold">
          Start a New Interview
        </h1>

        <p className="mt-1 text-muted-foreground text-sm">
          Choose your interview domain and difficulty.
        </p>
      </div>

      {/* Domains */}

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Domain
        </h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          {domains.map((d) => {
            const active = d.id === domain;

            return (
              <motion.button
                key={d.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDomain(d.id)}
                type="button"
                className={`rounded-2xl p-5 text-left border transition-all ${
                  active
                    ? "bg-gradient-primary border-transparent shadow-glow"
                    : "glass border-white/10 hover:border-primary/40"
                }`}
              >

                <div className="flex items-center gap-3">

                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      active
                        ? "bg-white/20"
                        : "bg-gradient-ai"
                    }`}
                  >
                    <d.icon className="h-5 w-5 text-white" />
                  </div>

                  <div className="font-semibold">
                    {d.id}
                  </div>

                </div>

                <p
                  className={`mt-2 text-xs ${
                    active
                      ? "text-white/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {d.desc}
                </p>

              </motion.button>
            );
          })}

        </div>
      </div>

      {/* Difficulty */}

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Difficulty
        </h2>

        <div className="mt-3 flex gap-3">

          {difficulties.map((d) => {
            const active = d === difficulty;

            return (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`rounded-full px-5 py-2 transition ${
                  active
                    ? "bg-gradient-primary shadow-glow text-white"
                    : "glass hover:bg-white/10"
                }`}
              >
                {d}
              </button>
            );
          })}

        </div>
      </div>

      {/* Summary */}

      <div className="glass rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">

        <div className="flex-1">

          <div className="text-sm text-muted-foreground">
            Selected Interview
          </div>

          <div className="text-lg font-semibold mt-1">
            {domain} •{" "}
            <span className="text-gradient-primary">
              {difficulty}
            </span>
          </div>

        </div>

        <Button
          size="lg"
          className="bg-gradient-primary shadow-glow"
          onClick={startInterview}
          disabled={loading}
        >

          {loading
            ? "Creating..."
            : "Start Interview"}

          <ArrowRight className="ml-2 h-4 w-4" />

        </Button>

      </div>

    </div>
  );
}