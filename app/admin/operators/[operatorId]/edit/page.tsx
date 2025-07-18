"use client"
import { getOperatorDetailsForAdmin } from "@/lib/actions/operator.actions"
import EditOperatorForm from "./edit-operator-form"
import { notFound } from "next/navigation"

export default async function EditOperatorPage({ params }: { params: { operatorId: string } }) {
  const operator = await getOperatorDetailsForAdmin(params.operatorId)

  if (!operator) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Modifica Operatore: {operator.full_name}</h2>
      </div>
      <EditOperatorForm operator={operator} />
    </div>
  )
}

// EditOperatorForm component can be defined here if needed
// function EditOperatorForm({ operator }: { operator: Operator }) {
//   const [isSaving, setIsSaving] = useState(false)
//   const [commissionValue, setCommissionValue] = useState<number>(0)
//   const router = useRouter()

//   const handleSaveOperator = async () => {
//     setIsSaving(true)
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 1000))
//       const success = updateOperator(operator.id, {
//         name: operator.name,
//         email: operator.email,
//         phone: operator.phone,
//         discipline: operator.discipline,
//         description: operator.description,
//         isActive: operator.isActive,
//         status: operator.status,
//       })

//       if (success) {
//         toast({
//           title: "Operatore aggiornato",
//           description: "I dati dell'operatore sono stati salvati con successo.",
//         })
//         router.push("/admin/operators")
//       } else {
//         throw new Error("Errore nel salvataggio")
//       }
//     } catch (error) {
//       toast({
//         title: "Errore",
//         description: "Errore nel salvataggio dei dati.",
//         variant: "destructive",
//       })
//     }
//     setIsSaving(false)
//   }

//   const handleUpdateCommission = async () => {
//     setIsSaving(true)
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 800))
//       const success = updateOperatorCommission(operator.id, commissionValue)

//       if (success) {
//         setOperator((prev) => (prev ? { ...prev, commission: `${commissionValue}%` } : null))
//         toast({
//           title: "Commissione aggiornata",
//           description: `Commissione aggiornata a ${commissionValue}%`,
//         })
//       } else {
//         throw new Error("Errore nell'aggiornamento")
//       }
//     } catch (error) {
//       toast({
//         title: "Errore",
//         description: "Errore nell'aggiornamento della commissione.",
//         variant: "destructive",
//       })
//     }
//     setIsSaving(false)
//   }

//   const handleInputChange = (field: keyof Operator, value: string | number | boolean) => {
//     setOperator((prev) => (prev ? { ...prev, [field]: value } : null))
//   }

//   return (
//     <div className="space-y-6">
//       {/* Existing code for EditOperatorForm */}
//     </div>
//   )
// }
