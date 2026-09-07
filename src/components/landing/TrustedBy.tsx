import { motion } from "framer-motion";

const logos = ["Google", "Meta", "Amazon", "Microsoft", "Netflix", "Stripe", "Airbnb", "Uber"];

export function TrustedBy() {
  return (
    <section className="py-16 border-y border-white/10 bg-card/30">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">
          Candidates from top companies practice on InterviewAI
        </p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
          {logos.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.8 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-center text-lg font-semibold text-muted-foreground hover:text-foreground transition"
            >
              {name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
