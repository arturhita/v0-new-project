import { CLIENT_REWARDS, OPERATOR_REWARDS } from "@/lib/gamification/rewards-system"

const GamificationPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gamification</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Client Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLIENT_REWARDS.map((reward) => (
            <div key={reward.id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold">{reward.name}</h3>
              <p>{reward.description}</p>
              <p>Points: {reward.points}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Operator Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {OPERATOR_REWARDS.map((reward) => (
            <div key={reward.id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold">{reward.name}</h3>
              <p>{reward.description}</p>
              <p>Points: {reward.points}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default GamificationPage
