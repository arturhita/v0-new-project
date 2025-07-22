import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ConstellationBackground } from "@/components/constellation-background"
import { HelpCircle } from "lucide-react"

const faqItems = [
  {
    question: "Come funziona Moonthir?",
    answer:
      "Moonthir è una piattaforma online che ti mette in contatto con cartomanti ed esperti spirituali qualificati. Puoi sfogliare i profili degli operatori, vedere le loro specializzazioni e recensioni, e scegliere la modalità di consulto che preferisci: chat, chiamata o domanda via email.",
  },
  {
    question: "I consulti sono riservati?",
    answer:
      "Assolutamente sì. La tua privacy è la nostra massima priorità. Tutte le comunicazioni tra te e l'operatore sono protette e confidenziali. Non condividiamo i tuoi dati personali con nessuno.",
  },
  {
    question: "Come posso pagare per un consulto?",
    answer:
      "Puoi ricaricare il tuo portafoglio virtuale sulla piattaforma utilizzando i principali metodi di pagamento come carta di credito o PayPal. Il costo del consulto verrà scalato direttamente dal tuo credito. Le transazioni sono sicure e protette.",
  },
  {
    question: "Cosa succede se non sono soddisfatto del consulto?",
    answer:
      "La tua soddisfazione è importante per noi. Se hai avuto un'esperienza non positiva, ti invitiamo a contattare il nostro supporto clienti tramite la pagina 'Contattaci'. Valuteremo ogni caso singolarmente per trovare una soluzione adeguata.",
  },
  {
    question: "Posso scegliere un operatore specifico?",
    answer:
      "Certo. Puoi consultare le schede personali di tutti i nostri operatori, che includono biografia, specialità, tariffe e recensioni lasciate da altri utenti. Questo ti permette di scegliere l'esperto che senti più in sintonia con te.",
  },
  {
    question: "Come faccio a diventare un operatore su Moonthir?",
    answer:
      "Siamo sempre alla ricerca di professionisti seri e appassionati. Se desideri unirti al nostro team, visita la sezione 'Diventa Esperto' sul nostro sito e compila il modulo di candidatura. Il nostro team valuterà attentamente ogni richiesta.",
  },
]

export default function FaqPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a192f]">
      <ConstellationBackground />
      <main className="relative z-10 flex flex-col items-center py-20 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-300 tracking-wider">Domande Frequenti (FAQ)</h1>
          <p className="text-lg text-gray-300 mt-4 max-w-3xl mx-auto">
            Trova qui le risposte alle domande più comuni sulla nostra piattaforma. Se non trovi quello che cerchi, non
            esitare a contattarci.
          </p>
        </div>

        <div className="w-full max-w-4xl">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-slate-900/80 border border-cyan-400/20 rounded-lg backdrop-blur-sm"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-200 hover:text-cyan-300 p-6">
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-3 text-cyan-400 flex-shrink-0" />
                    <span>{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0 text-gray-300">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  )
}
