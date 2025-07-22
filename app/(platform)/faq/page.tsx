import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ConstellationBackground } from "@/components/constellation-background"

const faqs = [
  {
    question: "Come funziona un consulto su Moonthir?",
    answer:
      "Scegli l'esperto che preferisci, controlla la sua disponibilità e seleziona la modalità di consulto: chat, chiamata o e-mail. Per chat e chiamate, se l'esperto è online, puoi iniziare subito. Altrimenti, puoi prenotare. Per le domande via e-mail, riceverai una risposta dettagliata entro il tempo indicato sul profilo dell'esperto.",
  },
  {
    question: "I consulti sono riservati?",
    answer:
      "Assolutamente sì. La tua privacy è la nostra massima priorità. Tutte le comunicazioni tra te e l'esperto sono protette e confidenziali. Non condividiamo i tuoi dati personali con nessuno.",
  },
  {
    question: "Come posso pagare?",
    answer:
      "Puoi ricaricare il tuo portafoglio virtuale su Moonthir utilizzando le principali carte di credito o altri metodi di pagamento sicuri. I minuti di consulto verranno scalati direttamente dal tuo credito disponibile.",
  },
  {
    question: "Cosa succede se un esperto non è disponibile?",
    answer:
      "Se un esperto non è online, puoi controllare il suo calendario per vedere la sua disponibilità futura e prenotare un consulto. Puoi anche attivare una notifica per essere avvisato non appena torna disponibile.",
  },
  {
    question: "Posso lasciare una recensione?",
    answer:
      "Certo. Dopo ogni consulto, avrai la possibilità di lasciare una recensione sull'esperienza avuta con l'esperto. Le recensioni aiutano gli altri utenti a scegliere e ci permettono di mantenere alta la qualità del servizio.",
  },
  {
    question: "Come vengono selezionati gli esperti?",
    answer:
      "Tutti i nostri esperti affrontano un rigoroso processo di selezione che valuta non solo le loro abilità e competenze nella cartomanzia e nella spiritualità, ma anche la loro etica professionale, empatia e capacità di ascolto.",
  },
]

export default function FaqPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      <ConstellationBackground />
      <div className="relative z-10 flex flex-col items-center py-16 md:py-24 px-4">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300 mb-4">
            Domande Frequenti (FAQ)
          </h1>
          <p className="text-lg text-gray-300 mb-12">
            Trova qui le risposte alle domande più comuni sulla nostra piattaforma.
          </p>
        </div>
        <div className="w-full max-w-3xl mx-auto bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 md:p-8 shadow-2xl shadow-blue-500/10">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border-b-blue-900/50">
                <AccordionTrigger className="text-left text-lg text-gray-100 hover:text-white hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base pt-2 pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
