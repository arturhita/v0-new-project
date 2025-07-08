export type Review = {
  id: string
  userName: string
  userType: "Vip" | "Utente"
  operatorName: string
  rating: number
  comment: string
  date: string
}
