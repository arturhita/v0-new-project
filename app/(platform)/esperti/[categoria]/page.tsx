import OperatorCard from "@/components/operator-card"

interface Props {
  params: {
    categoria: string
  }
}

export default function Page({ params }: Props) {
  const { categoria } = params

  return (
    <div>
      <h1>Esperti in {categoria}</h1>
      {/* Add your content here */}
      <OperatorCard />
    </div>
  )
}
