import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — InterviewAI" },
      { name: "description", content: "Log in to InterviewAI to continue your interview prep." },
      { property: "og:title", content: "Log in — InterviewAI" },
      { property: "og:description", content: "Continue your interview prep with AI." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await authService.login(form.get("email") as string, form.get("password") as string);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  }

  return <AuthShell title="Welcome back" subtitle="Log in to continue your prep." footer={
    <>Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link></>
  }>
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" name="email" type="email" placeholder="you@company.com" />
      <Field label="Password" name="password" type="password" placeholder="••••••••" />
      <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
        {loading ? "Signing in…" : "Login"}
      </Button>
    </form>
  </AuthShell>;
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 py-16 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-purple/20 blur-3xl animate-blob [animation-delay:-6s]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-3xl p-8 shadow-elegant"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-ai flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">
            Interview<span className="text-gradient-ai">AI</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-center">{title}</h1>
        <p className="mt-1 text-sm text-center text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </motion.div>
    </div>
  );
}

export function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required placeholder={placeholder} className="bg-white/5 border-white/10" />
    </div>
  );
}
