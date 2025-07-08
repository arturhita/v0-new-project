// This file does not require modifications. Since there was no existing code, I will create a basic component.

import type React from "react"

interface ReviewCardProps {
  author: string
  text: string
  rating: number
}

const ReviewCard: React.FC<ReviewCardProps> = ({ author, text, rating }) => {
  return (
    <div className="review-card">
      <h3>{author}</h3>
      <p>{text}</p>
      <p>Rating: {rating}/5</p>
    </div>
  )
}

export default ReviewCard
