import { Transaction, TransactionType } from "../src/domain/entities/Transaction"
import { Currency, Money } from "../src/domain/value-objects/Money"

export function createTransactionStub(
  overrides?: Partial<Pick<Transaction, "type" | "amount" | "description" | "date">>,
): Transaction {
  const parameters: Omit<Transaction, "id"> = {
    type: TransactionType.INCOME,
    amount: new Money(3000, Currency.USD),
    description: "Salary",
    date: new Date("2001-12-19"),
    ...overrides,
  }
  return new Transaction(
    parameters.type,
    parameters.amount,
    parameters.description,
    parameters.date,
  )
}
