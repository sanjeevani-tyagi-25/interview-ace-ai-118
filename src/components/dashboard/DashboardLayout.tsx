import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mic,
  FileText,
  History,
  User,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authService } from "@/services/api";
import { AxiosError } from "axios";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/start-interview", label: "Start Interview", icon: Mic },
  { to: "/dashboard/resume", label: "Resume Analyzer", icon: FileText },
  { to: "/dashboard/history", label: "History", icon: History },
  { to: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface CurrentUser {
  id: number;
  full_name: string;
  email: string;
}

export function DashboardLayout() {
  console.log("✅ DashboardLayout Rendered");

  const path = useRouterState({
    select: (s) => s.location.pathname,
  });

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    console.log("🚀 useEffect Started");

    let mounted = true;

    async function loadUser() {
      console.log("📡 Calling /users/me...");

      try {
        const data = await authService.getCurrentUser();

        console.log("✅ User received:", data);

        if (mounted) {
          setUser(data);
        }
      } catch (error) {
        console.error("❌ Error while fetching user:", error);

        if ((error as AxiosError).response?.status === 401) {
          authService.logout();

          toast.error("Session expired. Please login again.");

          navigate({
            to: "/login",
          });
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col`}
      >
        <Link
          to="/"
          className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-ai flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <span className="font-bold text-lg">
            Interview<span className="text-gradient-ai">AI</span>
          </span>
        </Link>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = path === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => {
              authService.logout();

              toast.success("Logged out successfully");

              navigate({
                to: "/login",
              });
            }}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/10 flex items-center px-4 sm:px-6 gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-muted-foreground">
              Welcome Back
            </span>

            <span className="font-semibold">
              {user ? user.full_name : "Loading..."}
            </span>
          </div>

          <div className="h-10 w-10 rounded-full bg-gradient-ai flex items-center justify-center text-white font-bold">
            {user
              ? user.full_name
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .toUpperCase()
              : "?"}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}