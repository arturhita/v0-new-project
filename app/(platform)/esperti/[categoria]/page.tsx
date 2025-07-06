import { getOperatorsByCategory } from "@/lib/actions/operator.public.actions"
import ClientPage from "./client-page"

type EspertiCategoriaPageProps = {
  params: {
    categoria: string
  }
}

export default async function EspertiCategoriaPage({ params }: EspertiCategoriaPageProps) {
  const decodedCategory = decodeURIComponent(params.categoria)
  const operators = await getOperatorsByCategory(decodedCategory)

  return <ClientPage operators={operators} category={decodedCategory} />
}
