import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — InterviewAI" },
      { name: "description", content: "Your InterviewAI dashboard: stats, recent interviews and quick actions." },
      { property: "og:title", content: "Dashboard — InterviewAI" },
      { property: "og:description", content: "Track your progress and start a new mock interview." },
    ],
  }),
  component: DashboardLayout,
});
