import { beforeAll, beforeEach, describe, expect, it } from "vitest"
import type { ITransactionRepository } from "../../../../src/application/interfaces/ITransactionRepository"
import { Transaction } from "../../../../src/domain/entities/Transaction"
import { createTransactionStub } from "../../../testUtils"
import SimpleIndexedDB from "../../../../src/infrastructure/database/SimpleIndexedDB"
import { TransactionRepository } from "../../../../src/infrastructure/repositories/TransactionRepository"

import "fake-indexeddb/auto" // Allow testing indexedDb at a nodejs environment

describe("TransactionRepository - Integration with IndexedDB", () => {
  const TEST_DB_NAME = "TestDB"
  const TEST_DB_VERSION = 1
  const TEST_OBJECT_STORE = "transactions"

  const indexedDBInstance = new SimpleIndexedDB(TEST_DB_NAME, TEST_DB_VERSION, [
    { name: TEST_OBJECT_STORE, keyPath: "id" },
  ])
  let transactionRepository: ITransactionRepository

  beforeEach(async function () {
    await indexedDBInstance.open()
    transactionRepository = new TransactionRepository(indexedDBInstance)
  })

  describe("Write", function () {
    it("Should create a transaction", async () => {
      // Arrange
      const transaction: Transaction = createTransactionStub()

      // Act
      const result = await transactionRepository.save(transaction)

      // Assert
      expect(result).toStrictEqual(transaction)
    })
  })

  describe("Read", function () {
    let transactions: Array<Transaction> = []

    beforeAll(async () => {
      transactions = [createTransactionStub(), createTransactionStub()]

      await Promise.all(
        transactions.map(async transaction => transactionRepository.save(transaction)),
      )
    })

    it("Should read all transactions", async () => {
      // Arrange - noOp
      // Act
      const result = await transactionRepository.findAll()

      // Assert
      expect(result).toStrictEqual(transactions)
    })

    it("Should read a transaction", async () => {
      // Arrange
      const transaction = transactions[0]
      const transactionId = transaction.id

      // Act
      const result = await transactionRepository.findById(transactionId)

      // Assert
      expect(result).toStrictEqual(transaction)
    })

    it("Should return null when transaction does not exist", async () => {
      // Arrange
      const transactionId = "invalid-id"

      // Act
      const result = await transactionRepository.findById(transactionId)

      // Assert
      expect(result).toStrictEqual(null)
    })
  })

  describe("Delete", function () {
    it("Should delete a transaction", async () => {
      // Arrange
      const transaction = createTransactionStub()
      await transactionRepository.save(transaction)
      const transactionId = transaction.id

      // Act
      const result = await transactionRepository.delete(transactionId)

      // Assert
      expect(result).toBeUndefined()
    })
  })
})
