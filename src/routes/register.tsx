import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/api";
import { toast } from "sonner";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — InterviewAI" },
      { name: "description", content: "Create your free InterviewAI account and start practicing." },
      { property: "og:title", content: "Create account — InterviewAI" },
      { property: "og:description", content: "Start your first mock interview in minutes." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    if (password !== form.get("confirm")) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authService.register(
        form.get("name") as string,
        form.get("email") as string,
        password,
      );
      toast.success("Account created!");
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. Upgrade when you're ready."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" name="name" placeholder="Ada Lovelace" />
        <Field label="Email" name="email" type="email" placeholder="you@company.com" />
        <Field label="Password" name="password" type="password" placeholder="At least 8 characters" />
        <Field label="Confirm password" name="confirm" type="password" placeholder="Repeat password" />
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-primary shadow-glow"
        >
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
