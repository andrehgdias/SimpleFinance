import { beforeEach, describe, expect, it, vi } from "vitest"
import { Transaction, TransactionType } from "../../../../src/domain/entities/Transaction"
import { Currency, Money } from "../../../../src/domain/value-objects/Money"
import {
  CreateTransactionDto,
  TransactionService,
  UpdateTransactionDto,
} from "../../../../src/application/services/TransactionService"
import type { ITransactionRepository } from "../../../../src/application/interfaces/ITransactionRepository"
import { NotFoundError } from "../../../../src/application/errors/NotFoundError"
import { createTransactionStub } from "../../../testUtils"

describe("Transaction Service", () => {
  let transactionService: TransactionService
  let mockTransactionRepository: ITransactionRepository

  beforeEach(() => {
    mockTransactionRepository = {
      save: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
    }
    transactionService = new TransactionService(mockTransactionRepository)
  })

  describe("Create", function () {
    it("createTransaction: Should create a transaction and save to the repository", async () => {
      //Arrange
      const createTransactionDTO: CreateTransactionDto = {
        type: TransactionType.INCOME,
        value: 100,
        currency: Currency.USD,
        description: "Refund",
        date: new Date("2001-12-19"),
      }
      vi.mocked(mockTransactionRepository).save.mockImplementation((transaction: Transaction) =>
        Promise.resolve(transaction),
      )

      // Act
      const result: Transaction = await transactionService.createTransaction(createTransactionDTO)

      // Assert
      // Service returns something
      expect(result).toBeDefined()
      // Service returns a Transaction (not something else)
      expect(result).toBeInstanceOf(Transaction)
      expect(result.id).toBeTruthy()

      // Service calls correct repository method
      expect(mockTransactionRepository.save).toHaveBeenCalledTimes(1)
      // Service creates a Transaction from DTO and calls repository
      expect(mockTransactionRepository.save).toHaveBeenCalledWith(result)
    })
  })

  describe("Read", function () {
    it("Should find all transactions", async () => {
      //Arrange
      const allTransactions = [createTransactionStub(), createTransactionStub()]
      vi.mocked(mockTransactionRepository).findAll.mockResolvedValue(allTransactions)

      // Act
      const transactions: Array<Transaction> = await transactionService.getAllTransactions()

      // Assert
      expect(transactions).toBe(allTransactions)
      expect(mockTransactionRepository.findAll).toHaveBeenCalledTimes(1)
    })

    it("Should find transaction by id", async () => {
      //Arrange
      const transactionStub = createTransactionStub()
      const id = transactionStub.id
      vi.mocked(mockTransactionRepository).findById.mockResolvedValue(transactionStub)

      // Act
      const transaction: Transaction = await transactionService.getTransactionById(id)

      // Assert
      expect(transaction).toBe(transactionStub)
      expect(mockTransactionRepository.findById).toHaveBeenCalledTimes(1)
      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(id)
    })

    it("Should NOT find transaction by id", async () => {
      //Arrange
      const id = "missing-id"
      vi.mocked(mockTransactionRepository).findById.mockResolvedValue(null)

      // Act, Assert
      await expect(transactionService.getTransactionById(id)).rejects.toThrowError(NotFoundError)
      expect(mockTransactionRepository.findById).toHaveBeenCalledTimes(1)
      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(id)
    })
  })

  describe("Update", function () {
    describe("Success", function () {
      it("Field type", async () => {
        // Arrange
        const existingTransaction = createTransactionStub()
        const id = existingTransaction.id
        const type: TransactionType = TransactionType.OUTCOME
        const changes: UpdateTransactionDto = {
          type,
        }

        vi.mocked(mockTransactionRepository).findById.mockResolvedValue(existingTransaction)
        vi.mocked(mockTransactionRepository).save.mockImplementation(transactionToBeSaved =>
          Promise.resolve(transactionToBeSaved),
        )

        // Act
        const updatedTransaction = await transactionService.updateTransaction(id, changes)

        // Assert
        expect(updatedTransaction.id).toBe(id)

        expect(updatedTransaction.type).toBe(type)
        expect(updatedTransaction.description).toBe(existingTransaction.description)
        expect(updatedTransaction.amount).toBe(existingTransaction.amount)
        expect(updatedTransaction.date).toBe(existingTransaction.date)

        expect(mockTransactionRepository.findById).toHaveBeenCalledTimes(1)
        expect(mockTransactionRepository.findById).toHaveBeenCalledWith(id)
        expect(mockTransactionRepository.save).toHaveBeenCalledTimes(1)
      })

      it("Field description", async () => {
        // Arrange
        const existingTransaction = createTransactionStub()
        const id = existingTransaction.id
        const description = "Mac book Air"
        const changes: UpdateTransactionDto = {
          description,
        }

        vi.mocked(mockTransactionRepository).findById.mockResolvedValue(existingTransaction)
        vi.mocked(mockTransactionRepository).save.mockImplementation(transactionToBeSaved =>
          Promise.resolve(transactionToBeSaved),
        )

        // Act
        const updatedTransaction = await transactionService.updateTransaction(id, changes)

        // Assert
        expect(updatedTransaction.id).toBe(id)

        expect(updatedTransaction.description).toBe(description)
        expect(updatedTransaction.type).toBe(existingTransaction.type)
        expect(updatedTransaction.amount).toBe(existingTransaction.amount)
        expect(updatedTransaction.date).toBe(existingTransaction.date)

        expect(mockTransactionRepository.findById).toHaveBeenCalledTimes(1)
        expect(mockTransactionRepository.findById).toHaveBeenCalledWith(id)
        expect(mockTransactionRepository.save).toHaveBeenCalledTimes(1)
      })

      it("Field amount, update value", async () => {
        // Arrange
        const existingTransaction = createTransactionStub()
        const id = existingTransaction.id
        const value = 5000
        const changes: UpdateTransactionDto = {
          value,
        }

        vi.mocked(mockTransactionRepository).findById.mockResolvedValue(existingTransaction)
        vi.mocked(mockTransactionRepository).save.mockImplementation(transactionToBeSaved =>
          Promise.resolve(transactionToBeSaved),
        )

        // Act
        const updatedTransaction = await transactionService.updateTransaction(id, changes)

        // Assert
        expect(updatedTransaction.id).toBe(id)

        expect(updatedTransaction.amount).toStrictEqual(
          new Money(value, existingTransaction.amount.currency),
        )
        expect(updatedTransaction.type).toBe(existingTransaction.type)
        expect(updatedTransaction.description).toBe(existingTransaction.description)
        expect(updatedTransaction.date).toBe(existingTransaction.date)

        expect(mockTransactionRepository.findById).toHaveBeenCalledTimes(1)
        expect(mockTransactionRepository.findById).toHaveBeenCalledWith(id)
        expect(mockTransactionRepository.save).toHaveBeenCalledTimes(1)
      })

      it("Field date", async () => {
        // Arrange
        const existingTransaction = createTransactionStub()
        const id = existingTransaction.id
        const date = new Date("1970-12-31")
        const changes: UpdateTransactionDto = {
          date,
        }

        vi.mocked(mockTransactionRepository).findById.mockResolvedValue(existingTransaction)
        vi.mocked(mockTransactionRepository).save.mockImplementation(transactionToBeSaved =>
          Promise.resolve(transactionToBeSaved),
        )

        // Act
        const updatedTransaction = await transactionService.updateTransaction(id, changes)

        // Assert
        expect(updatedTransaction.id).toBe(id)

        expect(updatedTransaction.date).toBe(date)
        expect(updatedTransaction.type).toBe(existingTransaction.type)
        expect(updatedTransaction.description).toBe(existingTransaction.description)
        expect(updatedTransaction.amount).toBe(existingTransaction.amount)

        expect(mockTransactionRepository.findById).toHaveBeenCalledTimes(1)
        expect(mockTransactionRepository.findById).toHaveBeenCalledWith(id)
        expect(mockTransactionRepository.save).toHaveBeenCalledTimes(1)
      })

      it("Should update all fields transaction", async () => {
        // Arrange
        const existingTransaction = createTransactionStub()
        const id = existingTransaction.id

        vi.mocked(mockTransactionRepository).findById.mockResolvedValue(existingTransaction)
        vi.mocked(mockTransactionRepository).save.mockImplementation(transactionToBeSaved =>
          Promise.resolve(transactionToBeSaved),
        )

        const type = TransactionType.OUTCOME
        const value = 1200
        const currency = Currency.USD
        const description = "Mac book Air"
        const date = new Date("1999-12-13")
        const changes: UpdateTransactionDto = {
          type,
          value: value,
          currency,
          description,
          date,
        }
        // Act
        const updatedTransaction = await transactionService.updateTransaction(id, changes)

        // Assert
        expect(updatedTransaction.id).toBe(id)
        expect(updatedTransaction.type).toBe(type)
        expect(updatedTransaction.description).toBe(description)
        expect(updatedTransaction.amount).toStrictEqual(new Money(value, currency))
        expect(updatedTransaction.date).toBe(date)
        expect(mockTransactionRepository.findById).toHaveBeenCalledTimes(1)
        expect(mockTransactionRepository.findById).toHaveBeenCalledWith(id)
        expect(mockTransactionRepository.save).toHaveBeenCalledTimes(1)
      })
    })
    describe("Throws", function () {
      it("Should throw NotFoundError when transaction does not exist", async () => {
        // Arrange
        const id = "non-existing-id"
        vi.mocked(mockTransactionRepository).findById.mockResolvedValue(null)

        // Act, Assert
        await expect(
          transactionService.updateTransaction(id, {
            description: "Updated Description",
          }),
        ).rejects.toThrowError(NotFoundError)
        expect(mockTransactionRepository.findById).toHaveBeenCalledTimes(1)
        expect(mockTransactionRepository.findById).toHaveBeenCalledWith(id)
      })

      it("Should bubble Transaction::class errors", async () => {
        // Arrange
        const transactionStub = createTransactionStub()
        vi.mocked(mockTransactionRepository).findById.mockResolvedValue(transactionStub)

        // Act, Assert
        await expect(
          transactionService.updateTransaction(transactionStub.id, {
            description: "",
          }),
        ).rejects.toThrowError("Description is required")
      })
    })
  })

  describe("Delete", function () {
    it("Should delete a single transaction", async () => {
      // Arrange
      const existingTransaction = createTransactionStub()
      const id = existingTransaction.id
      vi.mocked(mockTransactionRepository).findById.mockResolvedValue(existingTransaction)
      vi.mocked(mockTransactionRepository).delete.mockResolvedValue()

      // Act
      // Assert
      await expect(transactionService.deleteTransaction(id)).resolves.toBe(undefined)

      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(id)
      expect(mockTransactionRepository.delete).toHaveBeenCalledTimes(1)
      expect(mockTransactionRepository.delete).toHaveBeenCalledWith(id)
    })

    it("Should throw due to transaction not found", async () => {
      // Arrange
      const id = "missing-transaction"
      vi.mocked(mockTransactionRepository).findById.mockResolvedValue(null)

      // Act, Assert
      await expect(transactionService.deleteTransaction(id)).rejects.toThrowError(NotFoundError)

      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(id)
      expect(mockTransactionRepository.delete).not.toHaveBeenCalled()
    })
  })
})
