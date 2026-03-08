import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { ITransactionRepository } from "../../../../src/application/interfaces/ITransactionRepository.ts"
import Transaction from "../../../../src/domain/entities/Transaction"
import { buildTransaction } from "../../../testUtils"
import SimpleIndexedDB from "../../../../src/infrastructure/database/SimpleIndexedDB"
import TransactionRepository from "../../../../src/infrastructure/repositories/TransactionRepository"

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

  afterEach(async function () {
    await indexedDBInstance.clearStore(TEST_OBJECT_STORE)
  })

  describe("Write", function () {
    it("Should create a transaction", async () => {
      // Arrange
      const transaction: Transaction = buildTransaction()

      // Act
      const result = await transactionRepository.save(transaction)

      // Assert
      expect(result).toStrictEqual(transaction)
    })

    it("Should save all data", async function () {
      // Arrange
      const data = [buildTransaction(), buildTransaction()]
      await transactionRepository.save(data[0])
      await transactionRepository.save(data[1])

      // Act
      const allData = await transactionRepository.findAll()

      // Assert
      expect(allData).toStrictEqual(data)
    })
  })

  describe("Read", function () {
    let transactions: Array<Transaction> = []

    beforeEach(async () => {
      transactions = [buildTransaction(), buildTransaction()]

      await Promise.all(
        transactions.map(async transaction => transactionRepository.save(transaction)),
      )
    })

    it("Should read all transactions", async () => {
      // Arrange - noOp
      // Act
      const result: Array<Transaction> = await transactionRepository.findAll()

      // Assert
      for (const resultElement of result) {
        expect(transactions).toContainEqual(resultElement)
      }
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
      const transaction = buildTransaction()
      await transactionRepository.save(transaction)
      const transactionId = transaction.id

      // Act
      const result = await transactionRepository.delete(transactionId)

      // Assert
      expect(result).toBeUndefined()
    })
  })
})
