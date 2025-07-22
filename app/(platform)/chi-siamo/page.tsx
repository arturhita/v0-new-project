import { BlueConstellationBackground } from "@/components/blue-constellation-background"

export default function ChiSiamoPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900">
      <BlueConstellationBackground />
      <main className="relative z-10 flex justify-center py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full bg-black/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10 shadow-2xl shadow-blue-500/20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 mb-8">
            Chi siamo – Moonthir, la nuova dimensione della cartomanzia online
          </h1>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              Moonthir è una piattaforma innovativa dedicata alla cartomanzia e alla consulenza spirituale, nata per
              offrire un punto di riferimento sicuro, professionale e riservato a chi cerca risposte, guida o
              semplicemente un momento di ascolto autentico. Crediamo nel potere delle connessioni profonde, nella
              sensibilità di chi sa leggere tra le righe del destino e nell'importanza di offrire un servizio etico,
              moderno e accessibile.
            </p>
            <p>
              Su Moonthir potrai entrare in contatto con cartomanti esperti e selezionati, pronti ad ascoltarti e a
              offrirti una lettura personalizzata e sincera. Che tu voglia chiarimenti su amore, lavoro, relazioni o
              evoluzione personale, troverai chi saprà accompagnarti nel tuo percorso interiore con empatia e
              discrezione.
            </p>
            <p>Offriamo tre modalità di consulto, pensate per adattarsi alle tue esigenze:</p>
            <ul className="list-disc list-inside space-y-3 pl-4 text-cyan-300/90">
              <li>
                <span className="text-gray-300">
                  <strong>Chat in tempo reale</strong>, per risposte immediate e riservate;
                </span>
              </li>
              <li>
                <span className="text-gray-300">
                  <strong>Chiamata vocale</strong>, per chi desidera un contatto più diretto ed emozionale;
                </span>
              </li>
              <li>
                <span className="text-gray-300">
                  <strong>Domanda via e-mail</strong>, per chi preferisce riflettere con calma e ricevere una risposta
                  dettagliata entro poche ore.
                </span>
              </li>
            </ul>
            <p>
              Moonthir nasce dall’unione tra tecnologia e spiritualità, per garantire un’esperienza fluida, intuitiva e
              sempre rispettosa del tuo tempo e delle tue emozioni. Ogni operatore ha una scheda personale con
              biografia, tariffe e recensioni, così puoi scegliere con chi entrare in sintonia.
            </p>
            <p>
              Il nostro obiettivo è creare uno spazio dove sentirti ascoltato, accolto e mai giudicato. Un luogo dove
              l’antica saggezza della cartomanzia incontra la comodità del digitale, mantenendo intatta la magia del
              consulto.
            </p>
            <p className="font-semibold text-cyan-200">
              Moonthir non è solo una piattaforma: è un’esperienza, un rifugio, un’opportunità per riscoprire te stesso
              attraverso il potere delle carte.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
