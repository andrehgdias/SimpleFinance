import { describe, expect, it } from "vitest"
import {
  TransactionRepository,
  type PersistedTransaction,
} from "../../../../src/infrastructure/repositories/TransactionRepository"
import { createTransactionStub } from "../../../testUtils"

describe("TransactionRepository", () => {
  const transactionRepository = new TransactionRepository()
  it("Should map a Transaction instance to a PersistedTransaction", () => {
    // Arrange
    const transaction = createTransactionStub()
    const expectedPojo = {
      id: transaction.id,
      date: transaction.date.getTime(),
      type: transaction.type,
      amountValue: transaction.amount.value,
      amountCurrency: transaction.amount.value,
      description: transaction.description,
    }

    // Act
    const persistedTransaction: PersistedTransaction =
      TransactionRepository.toPersistence(transaction)

    // Assert
    expect(persistedTransaction).toStrictEqual(expectedPojo)
  })

  it("Should map a POJO PersistedTransaction to a Transaction instance", () => {})

  describe("Failure", () => {
    it("Should fail to map a Transaction instance to a PersistedTransaction", () => {})

    it("Should fail to map a POJO PersistedTransaction to a Transaction instance", () => {})
  })
})
