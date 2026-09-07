import { motion } from "framer-motion";
import { Users, TrendingUp, Award, Clock } from "lucide-react";

const stats = [
  { icon: Users, value: "10,000+", label: "Active students" },
  { icon: TrendingUp, value: "2.3×", label: "Faster offer rate" },
  { icon: Award, value: "94%", label: "Satisfaction score" },
  { icon: Clock, value: "50k+", label: "Interviews taken" },
];

export function Stats() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-6 flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <s.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
