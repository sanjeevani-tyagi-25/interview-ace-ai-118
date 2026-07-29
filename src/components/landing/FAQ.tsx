import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is InterviewAI really free to start?",
    a: "Yes — you get free daily practice interviews and one resume analysis. Upgrade anytime.",
  },
  {
    q: "Which domains are supported?",
    a: "HR, DSA, Machine Learning, Data Science, System Design and Aptitude — with more coming.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. It runs entirely in your browser. Just allow microphone and camera when prompted.",
  },
  {
    q: "How accurate is the AI scoring?",
    a: "Our rubric was built with hiring managers from top tech companies and improves weekly.",
  },
  {
    q: "Can I export my report?",
    a: "Yes, you can download a PDF report of any interview or resume analysis.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs">
            FAQ
          </div>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
            Questions, answered
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="glass rounded-2xl px-5 border-none"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
