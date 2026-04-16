import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  type ITransactionRepository,
  SortingOrder
} from "../../../../src/application/interfaces/ITransactionRepository.ts"
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
    { name: TEST_OBJECT_STORE, keyPath: "id", indexes: ["date"] },
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
      for (const transaction of allData) {
        expect(allData).toContainEqual(transaction)
      }
    })
  })

  describe("Read", function () {
    let unorderedTransactions: Array<Transaction> = []

    beforeEach(async () => {
      unorderedTransactions = [
        buildTransaction({ date: new Date("2026-03-01") }),
        buildTransaction({ date: new Date("2026-03-03") }),
        buildTransaction({ date: new Date("2026-03-05") }),
        buildTransaction({ date: new Date("2026-03-04") }),
        buildTransaction({ date: new Date("2026-03-02") }),
      ]

      await Promise.all(
        unorderedTransactions.map(async transaction => transactionRepository.save(transaction)),
      )
    })

    it("Should read all transactions with no specific order", async () => {
      // Arrange - noOp
      // Act
      const result: Array<Transaction> = await transactionRepository.findAll()

      // Assert
      for (const resultElement of result) {
        expect(unorderedTransactions).toContainEqual(resultElement)
      }
    })

    describe("Order by date", function () {
      it("Should read all transactions in ascending order", async () => {
        // Arrange
        const ascendingTransactions = unorderedTransactions.sort(
          (a, b) => a.date.getTime() - b.date.getTime(),
        )

        // Act
        const result: Array<Transaction> = await transactionRepository.findAll({
          direction: SortingOrder.ASC,
        })

        // Assert
        expect(result).toStrictEqual(ascendingTransactions)
      })

      it("Should read all transactions in descending order", async () => {
        // Arrange
        const descendingTransactions = unorderedTransactions.sort(
          (a, b) => b.date.getTime() - a.date.getTime(),
        )

        // Act
        const result: Array<Transaction> = await transactionRepository.findAll({
          direction: SortingOrder.DESC,
        })

        // Assert
        expect(result).toStrictEqual(descendingTransactions)
      })
    })

    it("Should read a transaction", async () => {
      // Arrange
      const transaction = unorderedTransactions[0]
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
      const deletionResult = await transactionRepository.delete(transactionId)
      const findByIdResult = await transactionRepository.findById(transactionId)

      // Assert
      expect(deletionResult).toBeUndefined()
      expect(findByIdResult).toBeNull()
    })

    it("Deleting not found transaction should return void", async () => {
      // Arrange
      const transactionId = "unknown-transaction"

      // Act, Assert
      await expect(transactionRepository.delete(transactionId)).resolves.toBeUndefined()
    })
  })
})
