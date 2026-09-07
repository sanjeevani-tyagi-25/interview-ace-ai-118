import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [notify, setNotify] = useState(true);

  // ============================================================
  // LOAD NOTIFICATION SETTINGS
  // ============================================================

  useEffect(() => {
    const savedNotifications =
      localStorage.getItem("notifications");

    if (savedNotifications === "disabled") {
      setNotify(false);
    } else {
      setNotify(true);
    }
  }, []);

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  function handleNotificationsChange(value: boolean) {
    setNotify(value);

    localStorage.setItem(
      "notifications",
      value ? "enabled" : "disabled"
    );

    if (value) {
      toast.success("Notifications enabled.");
    } else {
      toast.success("Notifications disabled.");
    }
  }

  // ============================================================
  // PASSWORD
  // ============================================================

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  async function handleChangePassword() {
    if (!currentPassword.trim()) {
      toast.error("Please enter your current password.");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Please enter your new password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (currentPassword === newPassword) {
      toast.error(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      // Backend endpoint will be connected here.
      // For now we only validate the form.

      toast.success(
        "Password details validated successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Password update failed:", error);

      toast.error("Failed to update password.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Preferences and account controls.
        </p>
      </div>

      {/* ======================================================
          PREFERENCES
      ====================================================== */}

      <div className="glass rounded-3xl p-6 divide-y divide-border">

        {/* NOTIFICATIONS */}

        <SettingRow
          title="Notifications"
          desc={
            notify
              ? "Email notifications are enabled."
              : "Email notifications are disabled."
          }
          control={
            <Switch
              checked={notify}
              onCheckedChange={
                handleNotificationsChange
              }
            />
          }
        />

      </div>

      {/* ======================================================
          CHANGE PASSWORD
      ====================================================== */}

      <div className="glass rounded-3xl p-6 space-y-4">

        <div>
          <h3 className="font-semibold">
            Change password
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Update your account password securely.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          {/* CURRENT PASSWORD */}

          <div className="space-y-1.5">

            <Label>
              Current password
            </Label>

            <Input
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              placeholder="Enter current password"
              className="bg-background/50 border-border"
            />

          </div>

          {/* NEW PASSWORD */}

          <div className="space-y-1.5">

            <Label>
              New password
            </Label>

            <Input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="Enter new password"
              className="bg-background/50 border-border"
            />

          </div>

        </div>

        <p className="text-xs text-muted-foreground">
          New password must contain at least 8 characters.
        </p>

        <Button
          className="bg-gradient-primary shadow-glow"
          onClick={handleChangePassword}
          disabled={changingPassword}
        >
          {changingPassword
            ? "Updating..."
            : "Update password"}
        </Button>

      </div>

    </div>
  );
}

/* ============================================================
   SETTING ROW
   ============================================================ */

function SettingRow({
  title,
  desc,
  control,
}: {
  title: string;
  desc: string;
  control: React.ReactNode;
}) {
  return (
    <div className="py-4 flex items-center gap-4">

      <div className="flex-1">

        <div className="font-medium">
          {title}
        </div>

        <div className="text-sm text-muted-foreground">
          {desc}
        </div>

      </div>

      {control}

    </div>
  );
}
