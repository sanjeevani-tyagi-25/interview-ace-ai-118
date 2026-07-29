import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Play, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setMouse({
        x: ((e.clientX - r.left) / r.width - 0.5) * 20,
        y: ((e.clientY - r.top) / r.height - 0.5) * 20,
      });
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Gradient blobs */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full bg-primary/25 blur-3xl animate-blob" />
        <div className="absolute top-20 -right-32 h-[500px] w-[500px] rounded-full bg-purple/25 blur-3xl animate-blob [animation-delay:-4s]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-secondary/20 blur-3xl animate-blob [animation-delay:-8s]" />
        <div className="absolute inset-0 bg-gradient-hero" />
        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        {/* floating glowing circles */}
        {[
          { s: 14, t: "20%", l: "12%", d: "0s" },
          { s: 10, t: "70%", l: "22%", d: "-2s" },
          { s: 18, t: "30%", l: "85%", d: "-4s" },
          { s: 8, t: "80%", l: "78%", d: "-1s" },
          { s: 12, t: "55%", l: "60%", d: "-3s" },
        ].map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary-glow shadow-glow animate-float"
            style={{
              width: c.s,
              height: c.s,
              top: c.t,
              left: c.l,
              animationDelay: c.d,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-glow" />
            <span>Powered by GPT-class models</span>
            <span className="text-muted-foreground">· New voice AI</span>
          </motion.div>

          <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Crack Your Next
            <br />
            Interview with{" "}
            <span className="text-gradient-ai">AI</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Practice HR, DSA, System Design and more with an AI interviewer that adapts to you.
            Get instant feedback on your answers, tone, and confidence — no coach required.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-primary shadow-glow hover:shadow-purple-glow transition-all hover:-translate-y-0.5"
            >
              <Link to="/register">
                Start Free Interview <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass hover:bg-white/10">
              <Link to="/features">
                <Play className="mr-2 h-4 w-4" /> Explore Features
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              {["from-primary to-purple", "from-purple to-secondary", "from-secondary to-primary", "from-primary-glow to-purple-glow"].map(
                (g, i) => (
                  <div
                    key={i}
                    className={`h-9 w-9 rounded-full bg-gradient-to-br ${g} ring-2 ring-background`}
                  />
                ),
              )}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="text-foreground font-semibold">10,000+</span> students preparing
              </p>
            </div>
          </div>
        </motion.div>

        {/* AI Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
          style={{ transform: `translate(${mouse.x}px, ${mouse.y}px)` }}
        >
          <div className="relative aspect-square max-w-lg mx-auto">
            {/* orbit rings */}
            <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse-glow" />
            <div className="absolute inset-8 rounded-full border border-white/10" />
            <div className="absolute inset-16 rounded-full border border-white/5" />

            {/* glow */}
            <div className="absolute inset-10 rounded-full bg-gradient-ai opacity-40 blur-3xl animate-pulse-glow" />

            {/* central bot */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative h-56 w-56 rounded-[2rem] bg-gradient-ai shadow-purple-glow flex items-center justify-center text-8xl">
                🤖
                <div className="absolute -bottom-3 -right-3 glass rounded-2xl px-3 py-2 text-xs font-medium flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                  Listening…
                </div>
              </div>
            </motion.div>

            {/* floating chips */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
              className="absolute top-6 -left-4 glass rounded-2xl p-4 shadow-elegant"
            >
              <div className="text-xs text-muted-foreground">Confidence</div>
              <div className="text-2xl font-bold text-gradient-primary">92%</div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
              className="absolute bottom-8 -right-4 glass rounded-2xl p-4 shadow-elegant"
            >
              <div className="text-xs text-muted-foreground">Question 3 / 10</div>
              <div className="text-sm font-semibold mt-0.5">System Design · Hard</div>
            </motion.div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.2 }}
              className="absolute bottom-24 -left-6 glass rounded-full px-3 py-2 text-xs flex items-center gap-1.5"
            >
              <Sparkles className="h-3 w-3 text-purple-glow" /> AI feedback
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
