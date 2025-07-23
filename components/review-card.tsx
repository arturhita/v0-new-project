import type React from "react"

interface ReviewCardProps {
  author: string
  text: string
  rating: number
}

const ReviewCard: React.FC<ReviewCardProps> = ({ author, text, rating }) => {
  const stars = Array.from({ length: rating }, (_, index) => (
    <span key={index} style={{ color: "gold" }}>
      ★
    </span>
  ))

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px", borderRadius: "5px" }}>
      <h3>{author}</h3>
      <div>{stars}</div>
      <p>{text}</p>
    </div>
  )
}

export default ReviewCard
