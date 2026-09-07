import { motion } from "framer-motion";
import { UserPlus, Sparkles, MessageSquare, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create your profile",
    desc: "Sign up and tell us your target role, experience and preferred domains.",
  },
  {
    icon: Sparkles,
    title: "Pick a domain",
    desc: "HR, DSA, ML, System Design, Aptitude — plus difficulty from easy to hard.",
  },
  {
    icon: MessageSquare,
    title: "Interview with AI",
    desc: "Answer via text or voice. The AI adapts follow-ups to your real answers.",
  },
  {
    icon: BarChart3,
    title: "Get instant report",
    desc: "Scores, radar chart and personalized tips — ready to apply next round.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs">
            How it works
          </div>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
            From nervous to <span className="text-gradient-primary">hired</span> in four steps
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative glass rounded-3xl p-6"
            >
              <div className="absolute top-4 right-5 text-5xl font-black text-white/5">
                0{i + 1}
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-ai flex items-center justify-center shadow-purple-glow">
                <s.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
