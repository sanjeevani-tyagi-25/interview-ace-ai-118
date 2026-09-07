import { motion } from "framer-motion";
import { Star } from "lucide-react";

const items = [
  {
    name: "Ananya Sharma",
    role: "SDE at Amazon",
    quote:
      "The AI feedback loop is unreal. I fixed my rambling in a week and landed my dream offer.",
  },
  {
    name: "Rohan Verma",
    role: "ML Engineer at Stripe",
    quote:
      "System Design mocks felt production-grade. The scoring rubric matched my real onsite.",
  },
  {
    name: "Priya Menon",
    role: "New grad at Google",
    quote:
      "Resume Analyzer alone doubled my callbacks. Then the voice AI polished my delivery.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs">
            Loved by candidates
          </div>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
            Real interviews. <span className="text-gradient-ai">Real offers.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-3xl p-6"
            >
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="h-10 w-10 rounded-full bg-gradient-ai" />
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
