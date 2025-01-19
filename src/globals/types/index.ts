export enum OrderStatus {
  Preparation = "preparation",
  Ontheway = "ontheway",
  Delivered = "delivered",
  Pending = "pending",
  Cancelled = "cancelled",
}

export enum PaymentMethod {
  Khalti = "khalti",
  Esewa = "esewa",
  COD = "cod",
}

export enum PaymentStatus {
  Paid = "paid",
  Unpaid = "unpaid",
}
export enum TransactionStatus {
  Pending = "Pending",
  Completed = "Completed",
  Expired = "Expired",
  Initiated = "Initiated",
  PartiallyRefunded = "Partially Refunded",
  UserCanceled = "User canceled",
  Refunded = "Refunded",
}
