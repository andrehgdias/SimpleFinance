import {beforeEach, describe, expect, it, vi} from "vitest";
import {Transaction, TransactionType} from "../../../../src/domain/entities/Transaction";
import {Currency, Money} from "../../../../src/domain/value-objects/Money";
import type {CreateTransactionDto} from "../../../../src/application/dtos/CreateTransactionDto";
import {TransactionService} from "../../../../src/application/services/TransactionService";
import type {ITransactionRepository} from "../../../../src/application/interfaces/ITransactionRepository";
import {NotFoundError} from "../../../../src/application/errors/NotFoundError"

describe("Transaction Service", () => {
    let transactionService: TransactionService;
    let mockTransactionRepository: ITransactionRepository;

    beforeEach(() => {
        mockTransactionRepository = {
            save: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn()
        }
        transactionService = new TransactionService(mockTransactionRepository);
    })

    describe("Create", function () {
        it('createTransaction: Should create a transaction and save to the repository', async () => {
            //Arrange
            const createTransactionDTO: CreateTransactionDto = {
                type: TransactionType.INCOME,
                amount: 100,
                currency: Currency.USD,
                description: "Refund",
                date: new Date("2021-12-19")
            }
            vi.mocked(mockTransactionRepository).save.mockImplementation((transaction: Transaction) => Promise.resolve(transaction))

            // Act
            const result: Transaction = await transactionService.createTransaction(createTransactionDTO);

            // Assert
            // Service returns something
            expect(result).toBeDefined();
            // Service returns a Transaction (not something else)
            expect(result).toBeInstanceOf(Transaction);
            expect(result.id).toBeTruthy();

            // Service calls correct repository method
            expect(mockTransactionRepository.save).toHaveBeenCalledTimes(1)
            // Service creates a Transaction from DTO and calls repository
            expect(mockTransactionRepository.save).toHaveBeenCalledWith(result);
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
        });

        it('Should NOT find transaction by id', async () => {
            //Arrange
            const id = "missing-id"
            vi.mocked(mockTransactionRepository).findById.mockResolvedValue(null)

            // Act, Assert
            await expect(transactionService.getTransactionById(id)).rejects.toThrowError(NotFoundError)
            expect(mockTransactionRepository.findById).toHaveBeenCalledTimes(1)
            expect(mockTransactionRepository.findById).toHaveBeenCalledWith(id)
        });
    })

    function createTransactionStub(overrides?: Partial<Pick<Transaction, "type" | "amount" | "description" | "date">>): Transaction {
        const parameters: Omit<Transaction, "id"> = {
            type: TransactionType.INCOME,
            amount: new Money(3000, Currency.USD),
            description: "Salary",
            date: new Date("2021-12-19"),
            ...overrides
        }
        return new Transaction(parameters.type,parameters.amount, parameters.description, parameters.date)
    }
})
