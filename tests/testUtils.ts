import Transaction, { TransactionType } from "../src/domain/entities/Transaction"
import Money, { Currency } from "../src/domain/value-objects/Money"

export const TEST_REFERENCE_DATE = new Date("2026-12-19")

export function buildTransaction(
  overrides: Partial<Pick<Transaction, "type" | "amount" | "description" | "date">> = {},
  referenceDate: Date = TEST_REFERENCE_DATE,
): Transaction {
  const parameters: Omit<Transaction, "id"> = {
    type: TransactionType.INCOME,
    amount: new Money(3000, Currency.EUR),
    description: "Salary",
    date: new Date("2001-12-19"),
    ...overrides,
  }
  return new Transaction(
    parameters.type,
    parameters.amount,
    parameters.description,
    parameters.date,
    referenceDate,
  )
}
