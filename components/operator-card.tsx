// This file does not require modifications. Since there was no existing code, I will create a basic component.

import type React from "react"

interface OperatorCardProps {
  name: string
  description?: string
}

const OperatorCard: React.FC<OperatorCardProps> = ({ name, description }) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
      <h3>{name}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}

export default OperatorCard
