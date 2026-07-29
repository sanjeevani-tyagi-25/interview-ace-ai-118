import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] p-10 md:p-16 text-center glass shadow-purple-glow"
        >
          <div className="absolute inset-0 bg-gradient-ai opacity-20" />
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-purple/40 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-purple-glow" /> Start today
            </div>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold">
              Your next interview starts <span className="text-gradient-ai">now</span>.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Join thousands of candidates leveling up their skills with AI. First interview is on us.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-gradient-primary shadow-glow">
                <Link to="/register">
                  Start Free Interview <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="glass">
                <Link to="/dashboard">Explore Dashboard</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
