import type {CreateTransactionDto} from "../dtos/CreateTransactionDto.ts";
import {Transaction} from "../../domain/entities/Transaction.ts";
import {Money} from "../../domain/value-objects/Money.ts";
import type {ITransactionRepository} from "../interfaces/ITransactionRepository.ts";

export class TransactionService {
    constructor(private readonly transactionRepository: ITransactionRepository) {
    }

    async createTransaction({type, amount, currency, description, date}: CreateTransactionDto): Promise<Transaction> {
        const newTransaction = new Transaction(type, new Money(amount, currency), description, date);
        return await this.transactionRepository.save(newTransaction)
    }
}