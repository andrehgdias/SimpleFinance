import type { CreateTransactionDto, UpdateTransactionDto } from "../dtos/TransactionDto.ts"
import { Transaction } from "../../domain/entities/Transaction.ts"
import { Money } from "../../domain/value-objects/Money.ts"
import type { ITransactionRepository } from "../interfaces/ITransactionRepository.ts"
import { NotFoundError } from "../errors/NotFoundError.ts"

export class TransactionService {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async createTransaction({
    type,
    value,
    currency,
    description,
    date,
  }: CreateTransactionDto): Promise<Transaction> {
    const newTransaction = new Transaction(type, new Money(value, currency), description, date)
    return await this.transactionRepository.save(newTransaction)
  }

  async getAllTransactions(): Promise<Array<Transaction>> {
    return await this.transactionRepository.findAll()
  }

  async getTransactionById(id: string): Promise<Transaction> {
    const transaction: Transaction | null = await this.transactionRepository.findById(id)
    if (!transaction) {
      throw new NotFoundError(`Transaction with id ${id} not found`)
    }
    return transaction
  }

  async updateTransaction(id: string, changes: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id)
    if (!transaction) {
      throw new NotFoundError(`Transaction with id ${id} not found`)
    }

    const resolvedType = changes.type ?? transaction.type
    const resolvedAmount =
      changes.value !== undefined || changes.currency !== undefined
        ? new Money(
            changes.value ?? transaction.amount.value,
            changes.currency ?? transaction.amount.currency,
          )
        : transaction.amount
    const resolvedDescription = changes.description ?? transaction.description
    const resolvedDate = changes.date ?? transaction.date

    const updatedTransaction = new Transaction(
      resolvedType,
      resolvedAmount,
      resolvedDescription,
      resolvedDate,
      transaction.id,
    )

    return await this.transactionRepository.save(updatedTransaction)
  }
}
