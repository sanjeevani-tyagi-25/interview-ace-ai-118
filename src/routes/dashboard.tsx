import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import AuthGuard from "@/components/AuthGuard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      {
        title: "Dashboard — InterviewAI",
      },
      {
        name: "description",
        content:
          "Your InterviewAI dashboard: stats, recent interviews and quick actions.",
      },
    ],
  }),

  component: Dashboard,
});

function Dashboard() {
  return (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  );
}