import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ConstellationBackground from "@/components/constellation-background"

export default function FAQPage() {
  const clientFaqs = [
    {
      question: "Come posso creare un account?",
      answer:
        "Puoi creare un account gratuitamente cliccando sul pulsante 'Registrati' in alto a destra. Segui la procedura guidata inserendo la tua email e scegliendo una password. In pochi istanti sarai parte della nostra community.",
    },
    {
      question: "Come trovo l'esperto giusto per me?",
      answer:
        "Utilizza la nostra barra di ricerca o naviga tra le categorie (es. Cartomanti, Astrologi). Puoi filtrare gli esperti per specializzazione, prezzo e disponibilità. Leggi i profili e le recensioni degli altri utenti per fare la scelta migliore.",
    },
    {
      question: "Come funziona la tariffazione al minuto?",
      answer:
        "Molti dei nostri consulti (telefonici o chat) sono tariffati al minuto. Il costo è indicato chiaramente sul profilo di ogni esperto. L'importo verrà scalato dal tuo portafoglio virtuale solo per la durata effettiva del consulto. Hai sempre il pieno controllo della spesa.",
    },
    {
      question: "Quali metodi di pagamento sono accettati?",
      answer:
        "Accettiamo le principali carte di credito (Visa, MasterCard, American Express) e PayPal. Puoi ricaricare il tuo portafoglio in modo sicuro e veloce dalla tua dashboard personale.",
    },
    {
      question: "Le mie conversazioni sono private?",
      answer:
        "Assolutamente sì. La tua privacy è la nostra massima priorità. Tutte le comunicazioni tra te e l'esperto sono protette da crittografia e trattate con la massima riservatezza, in conformità con le normative sulla privacy.",
    },
  ]

  const operatorFaqs = [
    {
      question: "Come posso diventare un esperto sulla piattaforma?",
      answer:
        "Siamo sempre alla ricerca di professionisti qualificati. Visita la sezione 'Lavora con noi' e compila il modulo di candidatura. Il nostro team valuterà il tuo profilo e ti contatterà per i passaggi successivi.",
    },
    {
      question: "Come imposto la mia disponibilità?",
      answer:
        "Dalla tua dashboard operatore, puoi accedere alla sezione 'Disponibilità'. Qui potrai impostare un calendario settimanale con gli orari in cui sei disponibile per i consulti, oppure attivare/disattivare la tua disponibilità in tempo reale.",
    },
    {
      question: "Come e quando vengo pagato?",
      answer:
        "I tuoi guadagni vengono accumulati nel tuo pannello operatore. Potrai richiedere il pagamento secondo le modalità e le tempistiche definite nei nostri termini di servizio. Generalmente i pagamenti vengono elaborati su base mensile.",
    },
    {
      question: "Quali sono le commissioni della piattaforma?",
      answer:
        "La piattaforma trattiene una commissione percentuale sui guadagni generati da ogni consulto. I dettagli specifici sulle percentuali di commissione sono disponibili nel contratto che firmerai una volta approvato come nostro esperto.",
    },
  ]

  return (
    <div className="relative min-h-screen bg-slate-900 text-white">
      <ConstellationBackground />
      <div className="relative z-10 max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-500">
            Domande Frequenti (FAQ)
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Trova qui le risposte alle domande più comuni. Se non trovi quello che cerchi, non esitare a contattare il
            nostro supporto.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center text-white mb-8">Per i Clienti</h2>
          <Accordion type="single" collapsible className="w-full">
            {clientFaqs.map((faq, index) => (
              <AccordionItem
                key={`client-${index}`}
                value={`item-${index}`}
                className="bg-slate-800/50 border-blue-800 rounded-lg mb-4"
              >
                <AccordionTrigger className="text-lg font-medium text-left text-amber-300 hover:no-underline px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-300">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-white mb-8">Per gli Esperti</h2>
          <Accordion type="single" collapsible className="w-full">
            {operatorFaqs.map((faq, index) => (
              <AccordionItem
                key={`operator-${index}`}
                value={`item-${index}`}
                className="bg-slate-800/50 border-blue-800 rounded-lg mb-4"
              >
                <AccordionTrigger className="text-lg font-medium text-left text-amber-300 hover:no-underline px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-300">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
