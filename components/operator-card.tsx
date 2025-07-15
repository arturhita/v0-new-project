interface User {
  id: string
  name: string
  email: string
}

export function OperatorCard({ operator, currentUser }: { operator: any; currentUser: User | null }) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold">{operator.name}</h3>
      <p className="text-gray-600">{operator.specialization}</p>
      <p className="text-gray-600">Rating: {operator.rating}</p>
      <div className="mt-4">
        {!!currentUser ? (
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Contatta</button>
        ) : (
          <p className="text-gray-500">Devi essere loggato per contattare l'operatore.</p>
        )}
      </div>
    </div>
  )
}
