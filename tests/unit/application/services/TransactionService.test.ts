import {beforeEach, describe, expect, it, vi} from "vitest";
import {Transaction, TransactionType} from "../../../../src/domain/entities/Transaction";
import {Currency} from "../../../../src/domain/value-objects/Money";
import type {CreateTransactionDto} from "../../../../src/application/dtos/CreateTransactionDto";
import {TransactionService} from "../../../../src/application/services/TransactionService";
import type {ITransactionRepository} from "../../../../src/application/interfaces/ITransactionRepository";

describe("Transaction Service", () => {
    let transactionService: TransactionService;
    let mockTransactionRepository: ITransactionRepository;

    beforeEach(() => {
        mockTransactionRepository = {
            save: vi.fn().mockImplementation((transaction: Transaction) => Promise.resolve(transaction))
        };
        transactionService = new TransactionService(mockTransactionRepository);
    })

    it('Should create a transaction and save to the repository', async () => {
        //Arrange
        const createTransactionDTO: CreateTransactionDto = {
            type: TransactionType.INCOME,
            amount: 100,
            currency: Currency.USD,
            description: "Refund",
            date: new Date()
        }

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

    });
})