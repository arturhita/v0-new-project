import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { faqData } from "@/lib/faq-data"
import BlueConstellationBackground from "@/components/blue-constellation-background"

export default function FaqPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <BlueConstellationBackground />
      <div className="relative z-10 container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">Domande Frequenti</h1>
          <p className="mt-4 text-xl text-slate-300">Trova le risposte alle domande più comuni sul nostro servizio.</p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqData.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-slate-900/80 border border-slate-700 rounded-lg px-6 backdrop-blur-sm"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-300 text-base">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
