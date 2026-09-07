import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  UploadCloud,
  Pencil,
  Save,
  Camera,
  User,
} from "lucide-react";

import { authService } from "@/services/api";
import api from "@/lib/axios";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  // ============================================================
  // PROFILE STATE
  // ============================================================

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");
  const [experience, setExperience] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // ============================================================
  // PROFILE PHOTO STATE
  // ============================================================

  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    null
  );

  const [uploadingPhoto, setUploadingPhoto] =
    useState<boolean>(false);

  const photoInputRef =
    useRef<HTMLInputElement | null>(null);

  // ============================================================
  // RESUME STATE
  // ============================================================

  const [uploadingResume, setUploadingResume] =
    useState<boolean>(false);

  const [resumeFile, setResumeFile] =
    useState<File | null>(null);

  const resumeInputRef =
    useRef<HTMLInputElement | null>(null);

  // ============================================================
  // LOAD PROFILE
  // ============================================================

  useEffect(() => {
    async function loadProfile(): Promise<void> {
      try {
        setLoading(true);

        const user = await authService.getCurrentUser();

        setFullName(user.full_name ?? "");
        setEmail(user.email ?? "");
        setTargetRole(user.target_role ?? "");
        setExperience(user.experience ?? "");

        // --------------------------------------------------------
        // LOAD SAVED PROFILE PHOTO
        // --------------------------------------------------------

        if (user.profile_photo) {
          const photoUrl = user.profile_photo.startsWith("http")
            ? user.profile_photo
            : `http://localhost:8000${user.profile_photo}`;

          setProfilePhoto(`${photoUrl}?t=${Date.now()}`);
        } else {
          setProfilePhoto(null);
        }
      } catch (error: any) {
        console.error(
          "❌ Failed to load profile:",
          error?.response?.data || error
        );

        toast.error("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // ============================================================
  // SAVE PROFILE
  // ============================================================

  async function saveChanges(): Promise<void> {
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    if (!email.trim()) {
      toast.error("Email cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/users/me", {
        full_name: fullName.trim(),
        email: email.trim(),
        target_role: targetRole.trim(),
        experience: experience.trim(),
      });

      setFullName(response.data.full_name ?? "");
      setEmail(response.data.email ?? "");
      setTargetRole(response.data.target_role ?? "");
      setExperience(response.data.experience ?? "");

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error(
        "❌ Failed to update profile:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.detail ||
          "Failed to save profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // UPLOAD PROFILE PHOTO
  // ============================================================

  async function handleProfilePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    console.log("🔥 FILE INPUT CHANGE FIRED");

    const file = event.target.files?.[0];

    console.log("📁 Selected file:", file);

    if (!file) {
      console.log("❌ No file selected");
      return;
    }

    console.log("📁 Name:", file.name);
    console.log("📁 Type:", file.type);
    console.log("📁 Size:", file.size);

    // ----------------------------------------------------------
    // VALIDATE FILE TYPE
    // ----------------------------------------------------------

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
    ];

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(extension)
    ) {
      console.log(
        "❌ Invalid image:",
        file.type,
        extension
      );

      toast.error(
        "Please select a JPG, PNG, or WEBP image."
      );

      event.target.value = "";
      return;
    }

    // ----------------------------------------------------------
    // VALIDATE FILE SIZE
    // ----------------------------------------------------------

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      console.log("❌ File too large:", file.size);

      toast.error(
        "Profile photo must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    // ----------------------------------------------------------
    // SHOW IMMEDIATE PREVIEW
    // ----------------------------------------------------------

    const previewUrl = URL.createObjectURL(file);

    setProfilePhoto(previewUrl);

    console.log(
      "🖼️ Local preview created:",
      previewUrl
    );

    // ----------------------------------------------------------
    // UPLOAD TO BACKEND
    // ----------------------------------------------------------

    try {
      setUploadingPhoto(true);

      console.log(
        "📤 STARTING PROFILE PHOTO UPLOAD..."
      );

      const response =
        await authService.uploadProfilePhoto(file);

      console.log(
        "✅ PROFILE PHOTO UPLOAD RESPONSE:",
        response
      );

      // --------------------------------------------------------
      // GET SAVED DATABASE PATH
      // --------------------------------------------------------

      const uploadedPath =
        response?.profile_photo;

      console.log(
        "🗄️ Database profile_photo:",
        uploadedPath
      );

      if (!uploadedPath) {
        throw new Error(
          "Backend did not return a profile photo path."
        );
      }

      // --------------------------------------------------------
      // CREATE BACKEND IMAGE URL
      // --------------------------------------------------------

      const photoUrl =
        uploadedPath.startsWith("http")
          ? uploadedPath
          : `http://localhost:8000${uploadedPath}`;

      console.log(
        "🌐 Final profile photo URL:",
        photoUrl
      );

      // --------------------------------------------------------
      // USE SAVED BACKEND IMAGE
      // --------------------------------------------------------

      setProfilePhoto(
        `${photoUrl}?t=${Date.now()}`
      );

      toast.success(
        "Profile photo updated successfully!"
      );
    } catch (error: any) {
      console.error(
        "❌ PROFILE PHOTO UPLOAD FAILED:",
        error
      );

      console.error(
        "❌ Backend response:",
        error?.response?.data
      );

      // Remove preview if upload failed
      setProfilePhoto(null);

      toast.error(
        error?.response?.data?.detail ||
          error?.message ||
          "Failed to upload profile photo."
      );
    } finally {
      setUploadingPhoto(false);

      // Allow same file to be selected again
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    }
  }

  // ============================================================
  // UPLOAD RESUME
  // ============================================================

  async function uploadResume(): Promise<void> {
    if (!resumeFile) {
      toast.error(
        "Please select a PDF or DOCX resume first."
      );

      return;
    }

    // ----------------------------------------------------------
    // VALIDATE TYPE
    // ----------------------------------------------------------

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(resumeFile.type)) {
      toast.error(
        "Only PDF and DOCX files are supported."
      );

      return;
    }

    // ----------------------------------------------------------
    // VALIDATE SIZE
    // ----------------------------------------------------------

    if (resumeFile.size > 5 * 1024 * 1024) {
      toast.error(
        "Resume must be less than 5 MB."
      );

      return;
    }

    try {
      setUploadingResume(true);

      const formData = new FormData();

      formData.append(
        "file",
        resumeFile
      );

      await api.post(
        "/resume/analyze",
        formData
      );

      toast.success(
        "Resume uploaded and analyzed successfully!"
      );

      setResumeFile(null);

      if (resumeInputRef.current) {
        resumeInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error(
        "❌ Resume upload failed:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.detail ||
          "Failed to upload resume."
      );
    } finally {
      setUploadingResume(false);
    }
  }

  // ============================================================
  // SKILLS
  // ============================================================

  const skills: string[] = [
    "React",
    "TypeScript",
    "Python",
    "SQL",
    "System Design",
    "Machine Learning",
  ];

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Loading profile...
        </p>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <h1 className="text-3xl font-bold">
          Profile
        </h1>

        <p className="mt-1 text-muted-foreground">
          Keep your details up to date for personalized
          interviews.
        </p>
      </div>

      {/* ======================================================
          PROFILE CARD
      ====================================================== */}

      <div className="glass rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">

        {/* PROFILE PHOTO */}

        <div className="relative">

          <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-ai flex items-center justify-center shadow-purple-glow border border-white/10">

            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : fullName ? (
              <span className="text-3xl font-bold text-white">
                {fullName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="h-10 w-10 text-white" />
            )}

          </div>

          {/* CHANGE PHOTO BUTTON */}

          <button
            type="button"
            disabled={uploadingPhoto}
            onClick={() => {
              console.log(
                "📸 Opening profile photo picker..."
              );

              photoInputRef.current?.click();
            }}
            className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition disabled:opacity-60"
            title="Change profile photo"
          >
            {uploadingPhoto ? (
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>

          {/* HIDDEN PHOTO INPUT */}

          <input
            ref={photoInputRef}
            id="profile-photo-input"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleProfilePhotoChange}
          />

        </div>

        {/* PROFILE INFORMATION */}

        <div className="flex-1">

          <h2 className="text-xl font-semibold">
            {fullName || "User"}
          </h2>

          <p className="text-sm text-muted-foreground">
            {email}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">

            {skills.map((skill: string) => (
              <Badge
                key={skill}
                className="bg-primary/20 text-primary border-primary/30"
              >
                {skill}
              </Badge>
            ))}

          </div>

        </div>

        {/* EDIT PROFILE */}

        <Button
          variant="outline"
          className="glass"
          onClick={() => {
            document
              .getElementById("personal-details")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>

      </div>

      {/* ======================================================
          PERSONAL DETAILS
      ====================================================== */}

      <div
        id="personal-details"
        className="glass rounded-3xl p-6 space-y-4"
      >

        <h3 className="font-semibold">
          Personal details
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">

          {/* FULL NAME */}

          <div className="space-y-1.5">

            <Label htmlFor="full-name">
              Full name
            </Label>

            <Input
              id="full-name"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              className="bg-white/5 border-white/10"
              placeholder="Enter your full name"
            />

          </div>

          {/* EMAIL */}

          <div className="space-y-1.5">

            <Label htmlFor="email">
              Email
            </Label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="bg-white/5 border-white/10"
              placeholder="Enter your email"
            />

          </div>

          {/* TARGET ROLE */}

          <div className="space-y-1.5">

            <Label htmlFor="target-role">
              Target role
            </Label>

            <Input
              id="target-role"
              value={targetRole}
              onChange={(event) =>
                setTargetRole(event.target.value)
              }
              className="bg-white/5 border-white/10"
              placeholder="e.g. Software Engineer"
            />

          </div>

          {/* EXPERIENCE */}

          <div className="space-y-1.5">

            <Label htmlFor="experience">
              Experience
            </Label>

            <Input
              id="experience"
              value={experience}
              onChange={(event) =>
                setExperience(event.target.value)
              }
              className="bg-white/5 border-white/10"
              placeholder="e.g. Fresher / 0 years"
            />

          </div>

        </div>

        <Button
          className="bg-gradient-primary shadow-glow"
          onClick={saveChanges}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />

          {saving
            ? "Saving..."
            : "Save changes"}
        </Button>

      </div>

      {/* ======================================================
          RESUME
      ====================================================== */}

      <div className="glass rounded-3xl p-6">

        <h3 className="font-semibold">
          Resume
        </h3>

        <div className="mt-4 rounded-2xl border-2 border-dashed border-white/15 p-6 text-center">

          <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />

          <p className="mt-2 text-sm text-muted-foreground">
            Drop a new resume to update your profile.
          </p>

          {/* HIDDEN RESUME INPUT */}

          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(event) => {
              const file =
                event.target.files?.[0] ?? null;

              setResumeFile(file);
            }}
          />

          {/* SELECT RESUME */}

          <Button
            type="button"
            variant="outline"
            className="glass mt-3"
            disabled={uploadingResume}
            onClick={() => {
              resumeInputRef.current?.click();
            }}
          >
            <UploadCloud className="h-4 w-4 mr-2" />

            {resumeFile
              ? "Change resume"
              : "Select resume"}
          </Button>

          {/* SELECTED FILE */}

          {resumeFile && (
            <div className="mt-3">

              <p className="text-sm font-medium truncate">
                {resumeFile.name}
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                {(
                  resumeFile.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </p>

            </div>
          )}

          {/* UPLOAD RESUME */}

          {resumeFile && (
            <div className="mt-3">

              <Button
                type="button"
                className="bg-gradient-primary shadow-glow"
                onClick={uploadResume}
                disabled={uploadingResume}
              >
                <UploadCloud className="h-4 w-4 mr-2" />

                {uploadingResume
                  ? "Uploading..."
                  : "Upload resume"}
              </Button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}