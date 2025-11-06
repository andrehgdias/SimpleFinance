import { beforeEach, describe, expect, it } from "vitest"
import {
  type PersistedTransaction,
  TransactionRepository,
} from "../../../../src/infrastructure/repositories/TransactionRepository"
import { createTransactionStub } from "../../../testUtils"
import { Transaction, TransactionType } from "../../../../src/domain/entities/Transaction"
import { Currency } from "../../../../src/domain/value-objects/Money"
import SimpleIndexedDB from "../../../../src/infrastructure/database/SimpleIndexedDB"

class TestableTransactionRepository extends TransactionRepository {
  constructor(mockIndexedDb: SimpleIndexedDB) {
    super(mockIndexedDb)
  }

  callToDomain(raw: PersistedTransaction) {
    return super.toDomain(raw)
  }

  callToPersistence(entity: Transaction) {
    return super.toPersistence(entity)
  }
}

describe("TransactionRepository", () => {
  let transactionRepository: TestableTransactionRepository
  const mockIndexedDB: Partial<SimpleIndexedDB> = {}

  beforeEach(() => {
    transactionRepository = new TestableTransactionRepository(mockIndexedDB as SimpleIndexedDB)
  })

  describe("Entity Mapper", () => {
    it("Should map a Transaction instance to a PersistedTransaction", () => {
      // Arrange
      const transaction = createTransactionStub()
      const expectedPojo = {
        id: transaction.id,
        date: transaction.date.getTime(),
        type: transaction.type,
        amountValue: transaction.amount.value,
        amountCurrency: transaction.amount.currency,
        description: transaction.description,
      }

      // Act
      const persistedTransaction: PersistedTransaction =
        transactionRepository.callToPersistence(transaction)

      // Assert
      expect(persistedTransaction).toStrictEqual(expectedPojo)
    })

    it("Should map a POJO PersistedTransaction to a Transaction instance", () => {
      // Arrange
      const transactionPojo = {
        id: "my-transaction",
        date: new Date("2001-12-19").getTime(),
        type: TransactionType.INCOME,
        amountValue: 1000,
        amountCurrency: Currency.USD,
        description: "First part of month salary",
      }

      // Act
      const transaction: Transaction = transactionRepository.callToDomain(transactionPojo)

      // Assert
      expect(transaction.id).toBe(transactionPojo.id)
      expect(transaction.type).toBe(transactionPojo.type)
      expect(transaction.date.getTime()).toBe(transactionPojo.date)
      expect(transaction.amount.value).toBe(transactionPojo.amountValue)
      expect(transaction.amount.currency).toBe(transactionPojo.amountCurrency)
      expect(transaction.description).toBe(transactionPojo.description)
    })

    it("Should fail to map a POJO PersistedTransaction to a Transaction instance", () => {
      //Arrange
      const invalidDatePojo: PersistedTransaction = {
        id: "invalid-date",
        date: NaN,
        type: TransactionType.INCOME,
        amountValue: 100,
        amountCurrency: Currency.USD,
        description: "My desc",
      }

      // Act, Assert
      expect(() => transactionRepository.callToDomain(invalidDatePojo)).toThrowError()
    })
  })
})
