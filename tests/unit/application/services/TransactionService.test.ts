import {beforeEach, describe, expect, it, vi} from "vitest"
import {Transaction, TransactionType} from "../../../../src/domain/entities/Transaction"
import {Currency, Money} from "../../../../src/domain/value-objects/Money"
import type {CreateTransactionDto, UpdateTransactionDto} from "../../../../src/application/dtos/TransactionDto"
import {TransactionService} from "../../../../src/application/services/TransactionService"
import type {ITransactionRepository} from "../../../../src/application/interfaces/ITransactionRepository"
import {NotFoundError} from "../../../../src/application/errors/NotFoundError"

describe("Transaction Service", () => {
    let transactionService: TransactionService
    let mockTransactionRepository: ITransactionRepository

    beforeEach(() => {
        mockTransactionRepository = {
            save: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn()
        }
        transactionService = new TransactionService(mockTransactionRepository)
    })

    describe("Create", function () {
        it('createTransaction: Should create a transaction and save to the repository', async () => {
            //Arrange
            const createTransactionDTO: CreateTransactionDto = {
                type: TransactionType.INCOME,
                value: 100,
                currency: Currency.USD,
                description: "Refund",
                date: new Date("2001-12-19")
            }
            vi.mocked(mockTransactionRepository).save.mockImplementation((transaction: Transaction) => Promise.resolve(transaction))

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
        it('Should find all transactions', async () => {
            //Arrange
            const allTransactions = [createTransactionStub(),createTransactionStub()]
            vi.mocked(mockTransactionRepository).findAll.mockResolvedValue(allTransactions)

            // Act
            const transactions: Array<Transaction> = await transactionService.getAllTransactions()

            // Assert
            expect(transactions).toBe(allTransactions)
            expect(mockTransactionRepository.findAll).toHaveBeenCalledTimes(1)
        })

        it('Should find transaction by id', async () => {
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

        it('Should NOT find transaction by id', async () => {
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
        it('Should update single field transaction', async () => {
            // Arrange
            const existingTransaction = createTransactionStub()
            const id = existingTransaction.id
            const description = "Mac book Air"
            const changes: UpdateTransactionDto = {
                description,
            }

            vi.mocked(mockTransactionRepository).findById.mockResolvedValue(existingTransaction)
            vi.mocked(mockTransactionRepository).save.mockImplementation(transactionToBeSaved => Promise.resolve(transactionToBeSaved))

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

        it('Should update all fields transaction', async () => {
            // Arrange
            const existingTransaction = createTransactionStub()
            const id = existingTransaction.id

            vi.mocked(mockTransactionRepository).findById.mockResolvedValue(existingTransaction)
            vi.mocked(mockTransactionRepository).save.mockImplementation(transactionToBeSaved => Promise.resolve(transactionToBeSaved))

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

        it('Should throw NotFoundError when transaction does not exist', async () => {
            // Arrange
            const id = "non-existing-id"
            vi.mocked(mockTransactionRepository).findById.mockResolvedValue(null)

            // Act, Assert
            await expect( transactionService.updateTransaction(id, {
                description: "Updated Description",
            })).rejects.toThrowError(NotFoundError)
            expect(mockTransactionRepository.findById).toHaveBeenCalledTimes(1)
            expect(mockTransactionRepository.findById).toHaveBeenCalledWith(id)
        })
    })

    function createTransactionStub(overrides?: Partial<Pick<Transaction, "type" | "amount" | "description" | "date">>): Transaction {
        const parameters: Omit<Transaction, "id"> = {
            type: TransactionType.INCOME,
            amount: new Money(3000, Currency.USD),
            description: "Salary",
            date: new Date("2001-12-19"),
            ...overrides
        }
        return new Transaction(parameters.type,parameters.amount, parameters.description, parameters.date)
    }
})
