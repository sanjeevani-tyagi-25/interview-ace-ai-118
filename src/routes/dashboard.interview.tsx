import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import { useEffect, useRef, useState } from "react";

import {
  Video,
  Mic,
  Timer,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  interviewService,
  type InterviewQuestion,
} from "@/services/api";

import { toast } from "sonner";

/* ============================================================
   ROUTE
   ============================================================ */

export const Route = createFileRoute("/dashboard/interview")({
  validateSearch: (search: Record<string, unknown>) => ({
    interviewId: Number(search.interviewId),
    domain: String(search.domain ?? "HR"),
    difficulty: String(search.difficulty ?? "Medium"),
  }),

  component: InterviewScreen,
});

/* ============================================================
   INTERVIEW SCREEN
   ============================================================ */

function InterviewScreen() {
  const navigate = useNavigate();

  /* ============================================================
     SEARCH PARAMETERS
     ============================================================ */

  const {
    interviewId,
    domain,
    difficulty,
  } = Route.useSearch();

  /* ============================================================
     STATE
     ============================================================ */

  const [questions, setQuestions] = useState<
    InterviewQuestion[]
  >([]);

  const [idx, setIdx] = useState(0);

  const [answers, setAnswers] = useState<
    Record<number, string>
  >({});

  /*
   * Keeps track of answers that have successfully reached
   * the backend.
   */
  const [submittedQuestions, setSubmittedQuestions] =
    useState<Set<number>>(new Set());

  const [seconds, setSeconds] = useState(0);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [isListening, setIsListening] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(false);

  const [tabWarnings, setTabWarnings] = useState(0);

  const [interviewTerminated, setInterviewTerminated] =
    useState(false);

  const recognitionRef = useRef<any>(null);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  /*
   * Prevent visibilitychange + blur from counting as two
   * warnings for one tab switch.
   */
  const lastViolationTimeRef = useRef(0);

  /* ============================================================
     CURRENT QUESTION
     ============================================================ */

  const current = questions[idx];

  /* ============================================================
     LOAD QUESTIONS
     ============================================================ */

  useEffect(() => {
    if (
      !interviewId ||
      !Number.isFinite(interviewId) ||
      interviewId <= 0
    ) {
      toast.error("Interview ID is missing.");

      navigate({
        to: "/dashboard/start-interview",
      });

      return;
    }

    const loadQuestions = async () => {
      try {
        setLoading(true);

        console.log(
          "🔥 Loading questions for interview:",
          interviewId
        );

        const data =
          await interviewService.getQuestions(
            interviewId
          );

        console.log(
          "🔥 Questions API response:",
          data
        );

        if (!Array.isArray(data)) {
          console.error(
            "❌ Questions response is not an array:",
            data
          );

          toast.error(
            "Invalid questions response from server."
          );

          setQuestions([]);
          return;
        }

        const sortedQuestions = [...data].sort(
          (a, b) =>
            a.question_order -
            b.question_order
        );

        console.log(
          "✅ Number of questions:",
          sortedQuestions.length
        );

        setQuestions(sortedQuestions);
        setIdx(0);

        if (sortedQuestions.length === 0) {
          toast.error(
            "No questions found for this interview."
          );
        }
      } catch (error: any) {
        console.error(
          "❌ Failed to load questions:",
          error?.response?.data || error
        );

        toast.error(
          error?.response?.data?.detail ||
            "Failed to load interview questions."
        );

        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [interviewId, navigate]);

  /* ============================================================
     TIMER
     ============================================================ */

  useEffect(() => {
    if (
      loading ||
      questions.length === 0 ||
      interviewTerminated
    ) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [
    loading,
    questions.length,
    interviewTerminated,
  ]);

  /* ============================================================
     TAB SWITCH / WINDOW BLUR DETECTION
     ============================================================ */

  useEffect(() => {
    if (
      loading ||
      questions.length === 0 ||
      interviewTerminated
    ) {
      return;
    }

    const handleViolation = () => {
      const now = Date.now();

      /*
       * visibilitychange and blur can happen almost together.
       * Ignore duplicate events within 1 second.
       */
      if (
        now - lastViolationTimeRef.current <
        1000
      ) {
        return;
      }

      lastViolationTimeRef.current = now;

      setTabWarnings((previous) => {
        const next = previous + 1;

        if (next >= 3) {
          toast.error(
            "Interview terminated because you left the interview window multiple times."
          );

          setInterviewTerminated(true);

          recognitionRef.current?.stop();

          streamRef.current
            ?.getTracks()
            .forEach((track) => track.stop());

          return next;
        }

        toast.warning(
          `Please stay on the interview page. Warning ${next}/3.`
        );

        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
    };

    const handleWindowBlur = () => {
      /*
       * Blur is only counted when the document itself
       * is still visible.
       */
      if (!document.hidden) {
        handleViolation();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "blur",
      handleWindowBlur
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "blur",
        handleWindowBlur
      );
    };
  }, [
    loading,
    questions.length,
    interviewTerminated,
  ]);

  /*
   * Navigate away only after the termination state has been
   * updated. This avoids doing navigation inside setState.
   */
  useEffect(() => {
    if (interviewTerminated) {
      const timeout = window.setTimeout(() => {
        navigate({
          to: "/dashboard",
        });
      }, 300);

      return () => {
        window.clearTimeout(timeout);
      };
    }
  }, [interviewTerminated, navigate]);

  /* ============================================================
     COPY / CUT / RIGHT CLICK PROTECTION
     ============================================================ */

  useEffect(() => {
    if (
      loading ||
      questions.length === 0 ||
      interviewTerminated
    ) {
      return;
    }

    const isFormField = () => {
      const activeElement =
        document.activeElement;

      if (!activeElement) {
        return false;
      }

      const tagName =
        activeElement.tagName.toLowerCase();

      return (
        tagName === "textarea" ||
        tagName === "input"
      );
    };

    const preventCopy = (
      event: ClipboardEvent
    ) => {
      if (isFormField()) {
        return;
      }

      event.preventDefault();

      toast.warning(
        "Copying interview questions is not allowed."
      );
    };

    const preventCut = (
      event: ClipboardEvent
    ) => {
      if (isFormField()) {
        return;
      }

      event.preventDefault();

      toast.warning(
        "Copying interview questions is not allowed."
      );
    };

    const preventContextMenu = (
      event: MouseEvent
    ) => {
      if (isFormField()) {
        return;
      }

      event.preventDefault();
    };

    const preventKeyboardCopy = (
      event: KeyboardEvent
    ) => {
      if (isFormField()) {
        return;
      }

      const key =
        event.key.toLowerCase();

      if (
        (event.ctrlKey || event.metaKey) &&
        ["c", "x", "a"].includes(key)
      ) {
        event.preventDefault();

        toast.warning(
          "Copying interview questions is not allowed."
        );
      }
    };

    document.addEventListener(
      "copy",
      preventCopy
    );

    document.addEventListener(
      "cut",
      preventCut
    );

    document.addEventListener(
      "contextmenu",
      preventContextMenu
    );

    document.addEventListener(
      "keydown",
      preventKeyboardCopy
    );

    return () => {
      document.removeEventListener(
        "copy",
        preventCopy
      );

      document.removeEventListener(
        "cut",
        preventCut
      );

      document.removeEventListener(
        "contextmenu",
        preventContextMenu
      );

      document.removeEventListener(
        "keydown",
        preventKeyboardCopy
      );
    };
  }, [
    loading,
    questions.length,
    interviewTerminated,
  ]);

  /* ============================================================
     TIMER FORMAT
     ============================================================ */

  const mm = String(
    Math.floor(seconds / 60)
  ).padStart(2, "0");

  const ss = String(
    seconds % 60
  ).padStart(2, "0");

  /* ============================================================
     ANSWER CHANGE
     ============================================================ */

  const handleAnswerChange = (
    value: string
  ) => {
    if (!current) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [current.id]: value,
    }));

    /*
     * If the user edits a previously submitted answer,
     * mark it as needing submission again.
     */
    setSubmittedQuestions((previous) => {
      const next = new Set(previous);
      next.delete(current.id);
      return next;
    });
  };

  /* ============================================================
     VOICE TO TEXT
     ============================================================ */

  const toggleVoiceRecording = () => {
    if (submitting) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        "Voice recognition is not supported in this browser."
      );

      return;
    }

    if (!current) {
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Listening...");
    };

    recognition.onresult = (
      event: any
    ) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0]
            .transcript;
      }

      if (
        transcript.trim() &&
        current
      ) {
        setAnswers((previous) => ({
          ...previous,
          [current.id]:
            `${previous[current.id] ?? ""} ${transcript}`.trim(),
        }));

        /*
         * Voice changes the answer, so it needs to be
         * submitted again.
         */
        setSubmittedQuestions((previous) => {
          const next = new Set(previous);
          next.delete(current.id);
          return next;
        });
      }
    };

    recognition.onerror = (
      event: any
    ) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);

      if (
        event.error !== "aborted"
      ) {
        toast.error(
          "Could not recognize your voice."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current =
      recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Speech recognition start error:",
        error
      );

      setIsListening(false);
    }
  };

  /* ============================================================
     CAMERA
     ============================================================ */

  const toggleCamera = async () => {
    if (isCameraOn) {
      streamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject =
          null;
      }

      setIsCameraOn(false);

      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: true,
            audio: false,
          }
        );

      streamRef.current = stream;

      setIsCameraOn(true);
    } catch (error) {
      console.error(
        "Camera access error:",
        error
      );

      toast.error(
        "Unable to access your camera. Please allow camera permission."
      );
    }
  };

  /* ============================================================
     ATTACH CAMERA STREAM
     ============================================================ */

  useEffect(() => {
    if (
      isCameraOn &&
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject =
        streamRef.current;

      videoRef.current
        .play()
        .catch((error) => {
          console.error(
            "Video play error:",
            error
          );
        });
    }
  }, [isCameraOn]);

  /* ============================================================
     CLEANUP
     ============================================================ */

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      streamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });
    };
  }, []);

  /* ============================================================
     SUBMIT ANSWER TO BACKEND
     ============================================================ */

  const saveCurrentAnswer = async () => {
    if (!current) {
      return false;
    }

    const answerText =
      answers[current.id]?.trim() ?? "";

    if (!answerText) {
      toast.error(
        "Please write an answer before continuing."
      );

      return false;
    }

    /*
     * If this exact answer has already been successfully
     * submitted, don't send it again.
     */
    if (
      submittedQuestions.has(current.id)
    ) {
      return true;
    }

    try {
      console.log(
        "📤 Submitting answer:",
        {
          question_id: current.id,
          answer_text: answerText,
        }
      );

      await interviewService.submitAnswer(
        current.id,
        answerText
      );

      console.log(
        "✅ Answer submitted successfully:",
        current.id
      );

      setSubmittedQuestions((previous) => {
        const next = new Set(previous);
        next.add(current.id);
        return next;
      });

      return true;
    } catch (error: any) {
      console.error(
        "❌ Failed to submit answer:",
        error?.response?.data ||
          error
      );

      toast.error(
        error?.response?.data?.detail ||
          "Failed to submit answer."
      );

      return false;
    }
  };

  /* ============================================================
     NEXT QUESTION
     ============================================================ */

  const handleNext = async () => {
    if (
      submitting ||
      !current
    ) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    try {
      setSubmitting(true);

      /*
       * IMPORTANT:
       * Save first.
       * Move to next question only after successful save.
       */
      const saved =
        await saveCurrentAnswer();

      if (!saved) {
        return;
      }

      setIdx((currentIndex) =>
        Math.min(
          questions.length - 1,
          currentIndex + 1
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================================================
     PREVIOUS QUESTION
     ============================================================ */

  const handlePrevious = () => {
    if (submitting) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setIdx((currentIndex) =>
      Math.max(
        0,
        currentIndex - 1
      )
    );
  };

  /* ============================================================
     FINAL SUBMIT
     ============================================================ */

  const handleSubmitInterview =
    async () => {
      if (
        submitting ||
        !current
      ) {
        return;
      }

      if (
        !interviewId ||
        !Number.isFinite(
          interviewId
        ) ||
        interviewId <= 0
      ) {
        toast.error(
          "Interview ID is missing."
        );

        return;
      }

      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }

      try {
        setSubmitting(true);

        /*
         * Save the final answer.
         */
        const saved =
          await saveCurrentAnswer();

        if (!saved) {
          return;
        }

        toast.success(
          "Final answer submitted!"
        );

        console.log(
          "📊 Generating report for interview:",
          interviewId
        );

        const report =
          await interviewService.generateReport(
            interviewId
          );

        console.log(
          "✅ Report generated:",
          report
        );

        toast.success(
          "Your interview report is ready!"
        );

        navigate({
          to: "/dashboard/reports",
          search: {
            interviewId,
          },
        });
      } catch (error: any) {
        console.error(
          "❌ Failed to submit interview:",
          error?.response?.data ||
            error
        );

        toast.error(
          error?.response?.data?.detail ||
            "Interview submitted, but report generation failed."
        );
      } finally {
        setSubmitting(false);
      }
    };

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">
            Loading interview...
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            Preparing your questions
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     TERMINATED
     ============================================================ */

  if (interviewTerminated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass rounded-3xl p-8 text-center max-w-md">
          <div className="text-xl font-bold">
            Interview terminated
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            You left the interview window multiple times.
          </p>

          <Button
            className="mt-5 bg-gradient-primary shadow-glow"
            onClick={() =>
              navigate({
                to: "/dashboard",
              })
            }
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  /* ============================================================
     NO QUESTIONS
     ============================================================ */

  if (
    !questions.length ||
    !current
  ) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">
            No questions found
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't find questions for this interview.
          </p>

          <Button
            className="mt-4 bg-gradient-primary shadow-glow"
            onClick={() =>
              navigate({
                to: "/dashboard/start-interview",
              })
            }
          >
            Start New Interview
          </Button>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN UI
     ============================================================ */

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Live Interview
          </div>

          <h1 className="text-2xl font-bold">
            {domain} · {difficulty}
          </h1>
        </div>

        <div className="glass rounded-full px-4 py-2 flex items-center gap-2 font-mono">
          <Timer className="h-4 w-4 text-primary" />

          {mm}:{ss}
        </div>
      </div>

      {/* ======================================================
          SECURITY NOTICE
      ====================================================== */}

      <div className="glass rounded-2xl px-4 py-3 text-sm">

        <div className="flex flex-wrap items-center justify-between gap-2">

          <span className="font-medium">
            Interview security is active
          </span>

          <span className="text-xs text-muted-foreground">
            Do not leave this window or copy interview questions.
          </span>

        </div>

        {tabWarnings > 0 && (
          <div className="mt-1 text-xs text-yellow-400">
            Window-switch warnings:{" "}
            {tabWarnings}/3
          </div>
        )}

      </div>

      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ====================================================
            LEFT SIDE
        ==================================================== */}

        <div className="lg:col-span-2 space-y-6">

          {/* ==================================================
              QUESTION
          ================================================== */}

          <div className="glass rounded-3xl p-6">

            <div className="flex items-center justify-between">

              <div className="text-xs text-muted-foreground">
                Question {idx + 1} of{" "}
                {questions.length}
              </div>

              <div className="text-xs text-muted-foreground">
                Interview #{interviewId}
              </div>

            </div>

            <div
              className="mt-3 select-none"
              onCopy={(event) => {
                event.preventDefault();

                toast.warning(
                  "Copying interview questions is not allowed."
                );
              }}
              onCut={(event) => {
                event.preventDefault();
              }}
              onContextMenu={(event) => {
                event.preventDefault();

                toast.warning(
                  "Right-click is disabled for interview questions."
                );
              }}
              onSelectStart={(event) => {
                event.preventDefault();
              }}
            >

              <p className="text-xl sm:text-2xl font-semibold leading-snug">
                {current.question_text}
              </p>

            </div>
          </div>

          {/* ==================================================
              ANSWER
          ================================================== */}

          <div className="glass rounded-3xl p-6">

            <label className="text-sm font-medium">
              Your Answer
            </label>

            <Textarea
              placeholder="Type your answer here or use the microphone..."
              value={
                answers[current.id] ?? ""
              }
              onChange={(event) =>
                handleAnswerChange(
                  event.target.value
                )
              }
              className="mt-2 min-h-[220px] bg-white/5 border-white/10 resize-none"
              disabled={submitting}
            />

            <div className="mt-4 flex flex-wrap justify-between gap-3">

              {/* PREVIOUS */}

              <Button
                variant="outline"
                className="glass"
                disabled={
                  idx === 0 ||
                  submitting
                }
                onClick={
                  handlePrevious
                }
              >
                <ChevronLeft className="h-4 w-4 mr-1" />

                Previous
              </Button>

              <div className="flex gap-2">

                {/* NEXT */}

                {idx <
                questions.length - 1 ? (

                  <Button
                    className="bg-gradient-primary shadow-glow"
                    onClick={
                      handleNext
                    }
                    disabled={
                      submitting
                    }
                  >

                    {submitting
                      ? "Saving..."
                      : "Next"}

                    <ChevronRight className="h-4 w-4 ml-1" />

                  </Button>

                ) : (

                  /* FINAL SUBMIT */

                  <Button
                    className="bg-gradient-ai shadow-purple-glow"
                    onClick={
                      handleSubmitInterview
                    }
                    disabled={
                      submitting
                    }
                  >

                    {submitting
                      ? "Generating Report..."
                      : "Submit Interview"}

                    <Send className="h-4 w-4 ml-1" />

                  </Button>

                )}

              </div>
            </div>
          </div>
        </div>

        {/* ====================================================
            RIGHT SIDE
        ==================================================== */}

        <div className="space-y-4">

          {/* ==================================================
              WEBCAM
          ================================================== */}

          <div className="glass rounded-3xl p-4">

            <div className="aspect-video rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center relative overflow-hidden">

              {isCameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-ai opacity-10" />

                  <Video className="h-10 w-10 text-muted-foreground" />
                </>
              )}

              {isCameraOn && (
                <div className="absolute top-2 left-2 glass rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1">

                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />

                  LIVE

                </div>
              )}

            </div>

            <Button
              type="button"
              onClick={
                toggleCamera
              }
              variant="outline"
              className="mt-3 w-full glass"
              disabled={submitting}
            >
              {isCameraOn
                ? "Turn Off Camera"
                : "Turn On Camera"}
            </Button>

            <div className="mt-2 text-xs text-muted-foreground text-center">
              {isCameraOn
                ? "Camera is on"
                : "Webcam preview"}
            </div>

          </div>

          {/* ==================================================
              MICROPHONE
          ================================================== */}

          <div className="glass rounded-3xl p-6 flex flex-col items-center">

            <button
              type="button"
              onClick={
                toggleVoiceRecording
              }
              disabled={submitting}
              className={`h-16 w-16 rounded-full flex items-center justify-center shadow-glow transition-all ${
                isListening
                  ? "bg-red-500 animate-pulse"
                  : "bg-gradient-primary animate-pulse-glow"
              }`}
            >
              <Mic className="h-7 w-7 text-white" />
            </button>

            <div className="mt-3 text-sm font-medium">
              {isListening
                ? "Listening..."
                : "Microphone"}
            </div>

            <div className="text-xs text-muted-foreground text-center">
              {isListening
                ? "Speak your answer"
                : "Tap to speak your answer"}
            </div>

            {isListening && (
              <div className="mt-3 flex gap-1 h-6 items-end">

                {[
                  6,
                  12,
                  18,
                  10,
                  14,
                  20,
                  8,
                  14,
                  10,
                  16,
                ].map(
                  (height, i) => (
                    <div
                      key={i}
                      style={{
                        height,
                      }}
                      className="w-1 rounded-full bg-gradient-ai animate-pulse"
                    />
                  )
                )}

              </div>
            )}

          </div>

          {/* ==================================================
              PROGRESS
          ================================================== */}

          <div className="glass rounded-3xl p-5">

            <div className="flex items-center justify-between">

              <div className="text-sm font-semibold">
                Progress
              </div>

              <div className="text-xs text-muted-foreground">
                {idx + 1}/
                {questions.length}
              </div>

            </div>

            <div className="mt-2 flex gap-1">

              {questions.map(
                (question, questionIndex) => {

                  const isCompleted =
                    submittedQuestions.has(
                      question.id
                    );

                  const isCurrent =
                    questionIndex === idx;

                  return (
                    <div
                      key={
                        question.id
                      }
                      className={`h-1.5 flex-1 rounded-full ${
                        isCompleted
                          ? "bg-gradient-primary"
                          : isCurrent
                            ? "bg-primary/50"
                            : "bg-white/10"
                      }`}
                    />
                  );
                }
              )}

            </div>

            <div className="mt-2 text-[11px] text-muted-foreground">
              {submittedQuestions.size} of{" "}
              {questions.length} answers saved
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
