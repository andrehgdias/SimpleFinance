import type {CreateTransactionDto} from "../dtos/CreateTransactionDto.ts";
import {Transaction} from "../../domain/entities/Transaction.ts";
import {Money} from "../../domain/value-objects/Money.ts";
import type {ITransactionRepository} from "../interfaces/ITransactionRepository.ts";
import {NotFoundError} from "../errors/NotFoundError.ts";

export class TransactionService {
    constructor(private readonly transactionRepository: ITransactionRepository) {
    }

    async createTransaction({type, amount, currency, description, date}: CreateTransactionDto): Promise<Transaction> {
        const newTransaction = new Transaction(type, new Money(amount, currency), description, date);
        return await this.transactionRepository.save(newTransaction)
    }

    async getAllTransactions(): Promise<Array<Transaction>> {
        return await this.transactionRepository.findAll();
    }

    async getTransactionById(id: string): Promise<Transaction> {
        const transaction: Transaction | null = await this.transactionRepository.findById(id);
        if (!transaction) {
            throw new NotFoundError(`Transaction with id ${id} not found`);
        }
        return transaction;
    }
}