import type Money from "../value-objects/Money.ts"

export enum TransactionType {
  INCOME,
  OUTCOME,
}

export default class Transaction {
  public readonly id: string
  private readonly _date: Date

  constructor(
    public readonly type: TransactionType,
    public readonly amount: Money,
    public readonly description: string,
    date: Date,
    referenceDate: Date = new Date(),
    id?: string,
  ) {
    this.id = id ?? crypto.randomUUID()

    if (!description || description.trim() === "") {
      throw new Error("Description is required")
    }

    const maxDate = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate(),
    )
    this._date = this.assertDate(date, maxDate)
  }

  get date(): Date {
    return this._date
  }

  private assertDate(date: Date, maxDate: Date) {
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date")
    }

    // Validate date is not in the future
    const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    if (transactionDate.getTime() > maxDate.getTime()) {
      throw new Error("Transaction date cannot be in the future")
    }

    return date
  }
}
