import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/api";
import { toast } from "sonner";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      {
        title: "Create account — InterviewAI",
      },
      {
        name: "description",
        content: "Create your free InterviewAI account.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const fullName = form.get("full_name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.register(
        fullName,
        email,
        password
      );

      console.log("Register Success:", data);

      localStorage.setItem(
        "token",
        data.access_token
      );

      toast.success("Registration Successful!");

      navigate({
        to: "/dashboard",
      });
    } catch (error: any) {
      console.error(error);

      const message =
        error?.response?.data?.detail ||
        "Registration failed";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start practicing AI interviews today."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary hover:underline"
          >
            Login
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Field
          label="Full Name"
          name="full_name"
          placeholder="Sanjeevani Tyagi"
        />

        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
        />

        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="********"
        />

        <Field
          label="Confirm Password"
          name="confirm"
          type="password"
          placeholder="********"
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-primary shadow-glow"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}