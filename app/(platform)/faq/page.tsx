import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { faqData } from "@/lib/faq-data"
import BlueConstellationBackground from "@/components/blue-constellation-background"
import Link from "next/link"

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
          {faqData.map((categoryItem) => (
            <div key={categoryItem.category} className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">{categoryItem.category}</h2>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {categoryItem.questions.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${categoryItem.category}-${index}`}
                    className="bg-slate-900/80 border border-slate-700 rounded-lg px-6 backdrop-blur-sm"
                  >
                    <AccordionTrigger className="text-left text-lg font-semibold text-white hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-300 text-base">
                      {item.answer.includes("Privacy Policy") ? (
                        <>
                          Assolutamente sì. La tua privacy è la nostra massima priorità. Tutte le conversazioni sono
                          confidenziali e protette. Per maggiori dettagli, puoi consultare la nostra{" "}
                          <Link href="/legal/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">
                            Privacy Policy
                          </Link>
                          .
                        </>
                      ) : item.answer.includes("Diventa Esperto") ? (
                        <>
                          Siamo sempre alla ricerca di professionisti seri e appassionati. Se vuoi unirti al nostro
                          team, visita la pagina{" "}
                          <Link href="/diventa-esperto" className="text-blue-400 hover:text-blue-300 underline">
                            Diventa Esperto
                          </Link>{" "}
                          e compila il modulo di candidatura. Il nostro team valuterà il tuo profilo e ti contatterà al
                          più presto.
                        </>
                      ) : (
                        item.answer
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
