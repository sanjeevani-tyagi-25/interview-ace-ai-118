import { motion } from "framer-motion";
import {
  Bot,
  FileText,
  Mic,
  Code2,
  BarChart3,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Mock AI Interviewer",
    desc: "Realistic, adaptive interviews across HR, DSA, ML, System Design and more.",
    color: "from-primary to-purple",
  },
  {
    icon: FileText,
    title: "Resume AI",
    desc: "ATS scoring, keyword gap analysis and instant rewrite suggestions.",
    color: "from-purple to-secondary",
  },
  {
    icon: Mic,
    title: "Voice AI",
    desc: "Speak your answers. We analyze tone, pace, filler words and confidence.",
    color: "from-secondary to-primary",
  },
  {
    icon: Code2,
    title: "Coding Rounds",
    desc: "Live DSA prompts with hints, complexity analysis and cleaner solutions.",
    color: "from-primary-glow to-purple-glow",
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    desc: "Technical, communication and confidence scores with visual breakdowns.",
    color: "from-purple to-primary",
  },
  {
    icon: MessageSquare,
    title: "Actionable Feedback",
    desc: "Line-by-line feedback on every answer so you know exactly what to fix.",
    color: "from-secondary to-purple",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs">
            Features
          </div>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
            Everything you need to <span className="text-gradient-ai">interview like a pro</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete AI interview studio — from resume to offer letter.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative rounded-3xl glass p-6 overflow-hidden transition-shadow hover:shadow-glow"
            >
              <div
                className={`absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${f.color} opacity-0 blur-3xl group-hover:opacity-40 transition-opacity`}
              />
              <div
                className={`relative h-12 w-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-glow`}
              >
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="relative mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
