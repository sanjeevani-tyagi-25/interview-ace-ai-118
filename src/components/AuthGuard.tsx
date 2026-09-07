import { useEffect, useState } from "react";
import { Navigate } from "@tanstack/react-router";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // localStorage is only available in the browser
    const token = localStorage.getItem("token");

    setAuthenticated(!!token);
    setChecking(false);
  }, []);

  // Wait until browser-side authentication check is complete
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  // No token → go to login
  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}