import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(true);
  const [notify, setNotify] = useState(true);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preferences and account controls.</p>
      </div>

      <div className="glass rounded-3xl p-6 divide-y divide-white/10">
        <SettingRow
          title="Dark mode"
          desc="Use dark theme across the app."
          control={<Switch checked={dark} onCheckedChange={setDark} />}
        />
        <SettingRow
          title="Notifications"
          desc="Email me reminders and weekly progress."
          control={<Switch checked={notify} onCheckedChange={setNotify} />}
        />
      </div>

      <div className="glass rounded-3xl p-6 space-y-4">
        <h3 className="font-semibold">Change password</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Current password</Label><Input type="password" className="bg-white/5 border-white/10" /></div>
          <div className="space-y-1.5"><Label>New password</Label><Input type="password" className="bg-white/5 border-white/10" /></div>
        </div>
        <Button className="bg-gradient-primary shadow-glow" onClick={() => toast.success("Password updated")}>Update password</Button>
      </div>
    </div>
  );
}

function SettingRow({ title, desc, control }: { title: string; desc: string; control: React.ReactNode }) {
  return (
    <div className="py-4 flex items-center gap-4">
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      {control}
    </div>
  );
}
