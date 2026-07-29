import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { interviewService, type InterviewRecord } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<InterviewRecord[]>([]);
  useEffect(() => { interviewService.getHistory().then(setItems); }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Interview history</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every session, one click away.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((r) => (
          <div key={r.id} className="glass rounded-3xl p-6 hover:shadow-glow transition">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary/20 text-primary border-primary/30">{r.domain}</Badge>
              <div className="text-3xl font-bold text-gradient-primary">{r.score}</div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> {r.date} · {r.difficulty}
            </div>
            <Button asChild variant="outline" className="glass mt-4 w-full">
              <Link to="/dashboard/reports">View Report <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
