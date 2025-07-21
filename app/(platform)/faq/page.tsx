import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"

export default function FAQPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">Domande Frequenti (FAQ)</h1>
          <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
            Trova le risposte alle domande più comuni sulla nostra piattaforma.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Domande Generali</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg text-left">Cos'è Moonthir?</AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 dark:text-gray-300">
                Moonthir è una piattaforma online che connette utenti in cerca di guida e chiarezza con esperti
                qualificati nel campo dell'astrologia, della cartomanzia e della crescita personale. Offriamo consulenze
                private e sicure tramite chat e telefono.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg text-left">Come funziona una consulenza?</AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 dark:text-gray-300">
                È semplice: registrati gratuitamente, ricarica il tuo portafoglio con i crediti, scegli l'esperto che
                preferisci e avvia una consulenza in chat o telefono. Il costo della consulenza viene scalato dai tuoi
                crediti al minuto, in modo trasparente e senza sorprese.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg text-left">La mia privacy è garantita?</AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 dark:text-gray-300">
                Assolutamente sì. La tua privacy è la nostra massima priorità. Tutte le conversazioni sono confidenziali
                e protette. Per maggiori dettagli, puoi consultare la nostra{" "}
                <Link href="/legal/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Privacy Policy
                </Link>
                .
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">Per i Clienti</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="client-1">
              <AccordionTrigger className="text-lg text-left">Come posso registrarmi?</AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 dark:text-gray-300">
                Clicca sul pulsante "Registrati" in alto a destra, compila i campi richiesti e accetta i termini di
                servizio. In pochi istanti avrai accesso alla piattaforma come cliente e potrai iniziare a esplorare i
                profili dei nostri esperti.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="client-2">
              <AccordionTrigger className="text-lg text-left">Come scelgo l'esperto giusto?</AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 dark:text-gray-300">
                Puoi navigare tra le diverse categorie di esperti o usare la barra di ricerca. Ogni esperto ha un
                profilo dettagliato con biografia, specializzazioni, tariffe e recensioni lasciate da altri utenti.
                Questo ti aiuterà a trovare la persona più adatta alle tue esigenze.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="client-3">
              <AccordionTrigger className="text-lg text-left">Come funziona il sistema di pagamento?</AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 dark:text-gray-300">
                La piattaforma utilizza un sistema di crediti. Dal tuo "Portafoglio" personale, puoi acquistare
                pacchetti di crediti utilizzando metodi di pagamento sicuri come la carta di credito (gestito da
                Stripe). I crediti non hanno scadenza e puoi usarli quando vuoi.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="client-4">
              <AccordionTrigger className="text-lg text-left">
                Posso lasciare una recensione dopo una consulenza?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 dark:text-gray-300">
                Certo! Anzi, ti incoraggiamo a farlo. Dopo ogni consulenza completata, avrai la possibilità di lasciare
                una valutazione e un commento sull'esperto. Le tue recensioni sono preziose per aiutare gli altri membri
                della community.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">Per gli Esperti</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="expert-1">
              <AccordionTrigger className="text-lg text-left">
                Come posso diventare un esperto su Moonthir?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 dark:text-gray-300">
                Siamo sempre alla ricerca di professionisti seri e appassionati. Se vuoi unirti al nostro team, visita
                la pagina{" "}
                <Link href="/diventa-esperto" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Lavora con noi
                </Link>{" "}
                e compila il modulo di candidatura. Il nostro team valuterà il tuo profilo e ti contatterà al più
                presto.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="expert-2">
              <AccordionTrigger className="text-lg text-left">Come e quando vengo pagato?</AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 dark:text-gray-300">
                Guadagni una commissione per ogni minuto di consulenza che offri. Potrai visualizzare i tuoi guadagni in
                tempo reale nella tua dashboard operatore. Potrai richiedere il pagamento dei tuoi compensi secondo i
                termini stabiliti nel nostro accordo per operatori.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="expert-3">
              <AccordionTrigger className="text-lg text-left">Come gestisco la mia disponibilità?</AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 dark:text-gray-300">
                Dalla tua dashboard personale, hai il pieno controllo. Puoi impostare un calendario di disponibilità
                settimanale e attivare o disattivare il tuo stato (Online/Offline) in qualsiasi momento con un semplice
                click, per ricevere richieste di consulenza solo quando sei pronto.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
