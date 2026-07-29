import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Pencil } from "lucide-react";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const skills = ["React", "TypeScript", "Python", "SQL", "System Design", "Machine Learning"];
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Keep your details up to date for personalized interviews.</p>
      </div>

      <div className="glass rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="h-24 w-24 rounded-3xl bg-gradient-ai flex items-center justify-center text-3xl font-bold shadow-purple-glow">
          S
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Sanjeevani Rao</h2>
          <p className="text-sm text-muted-foreground">sanjeevani@example.com</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((s) => (
              <Badge key={s} className="bg-primary/20 text-primary border-primary/30">{s}</Badge>
            ))}
          </div>
        </div>
        <Button variant="outline" className="glass"><Pencil className="h-4 w-4 mr-1" /> Edit Profile</Button>
      </div>

      <div className="glass rounded-3xl p-6 space-y-4">
        <h3 className="font-semibold">Personal details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Full name</Label><Input defaultValue="Sanjeevani Rao" className="bg-white/5 border-white/10" /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input defaultValue="sanjeevani@example.com" className="bg-white/5 border-white/10" /></div>
          <div className="space-y-1.5"><Label>Target role</Label><Input defaultValue="Software Engineer" className="bg-white/5 border-white/10" /></div>
          <div className="space-y-1.5"><Label>Experience</Label><Input defaultValue="2 years" className="bg-white/5 border-white/10" /></div>
        </div>
        <Button className="bg-gradient-primary shadow-glow">Save changes</Button>
      </div>

      <div className="glass rounded-3xl p-6">
        <h3 className="font-semibold">Resume</h3>
        <div className="mt-4 rounded-2xl border-2 border-dashed border-white/15 p-6 text-center">
          <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Drop a new resume to update your profile</p>
          <Button variant="outline" className="glass mt-3">Upload resume</Button>
        </div>
      </div>
    </div>
  );
}
