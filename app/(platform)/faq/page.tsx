import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ConstellationBackground from "@/components/constellation-background"

export default function FaqPage() {
  const faqs = [
    {
      question: "Come funziona un consulto su Moonthir?",
      answer:
        "Puoi scegliere tra tre modalità: Chat per risposte immediate, Chiamata per un contatto diretto, o Domanda via Email per una risposta dettagliata. Scegli l'esperto che preferisci, seleziona la modalità e inizia il tuo consulto. Il costo viene calcolato al minuto per chat e chiamate, o come tariffa fissa per le domande via email.",
    },
    {
      question: "Gli esperti sono qualificati?",
      answer:
        "Sì, tutti i nostri cartomanti e consulenti spirituali sono stati attentamente selezionati attraverso un processo di verifica che valuta la loro esperienza, professionalità ed etica. Puoi leggere le biografie e le recensioni su ogni profilo per scegliere l'esperto più in sintonia con te.",
    },
    {
      question: "Come viene protetta la mia privacy?",
      answer:
        "La tua privacy è la nostra massima priorità. Tutte le comunicazioni sulla piattaforma sono protette e riservate. Non condividiamo i tuoi dati personali con gli esperti, che vedranno solo il tuo nome utente. Per maggiori dettagli, puoi consultare la nostra Privacy Policy.",
    },
    {
      question: "Quali metodi di pagamento sono accettati?",
      answer:
        "Accettiamo le principali carte di credito e di debito. Puoi ricaricare il tuo portafoglio virtuale sulla piattaforma in modo sicuro e utilizzare il credito per i tuoi consulti, avendo sempre il pieno controllo della spesa.",
    },
    {
      question: "Cosa succede se non sono soddisfatto del consulto?",
      answer:
        "La tua soddisfazione è importante per noi. Se hai avuto un'esperienza non positiva, ti preghiamo di contattare il nostro supporto clienti all'indirizzo infomoonthir@gmail.com. Valuteremo la situazione e cercheremo la soluzione migliore.",
    },
    {
      question: "Posso parlare con lo stesso esperto più volte?",
      answer:
        "Certamente. Se hai trovato un esperto con cui ti trovi bene, puoi cercarlo direttamente sulla piattaforma e avviare un nuovo consulto quando è disponibile. Puoi anche aggiungerlo ai tuoi preferiti per trovarlo più facilmente.",
    },
  ]

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a192f]">
      <ConstellationBackground />
      <main className="relative z-10 container mx-auto py-20 px-4">
        <h1 className="text-4xl font-bold text-center text-cyan-300 mb-12 tracking-wider">Domande Frequenti (FAQ)</h1>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-slate-900/70 border-cyan-400/20 mb-4 rounded-lg backdrop-blur-sm"
              >
                <AccordionTrigger className="text-lg text-gray-200 hover:no-underline px-6 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 px-6 pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  )
}
