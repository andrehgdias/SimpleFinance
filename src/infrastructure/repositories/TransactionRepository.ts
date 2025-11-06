import type { ITransactionRepository } from "../../application/interfaces/ITransactionRepository.d.ts"
import { Transaction } from "../../domain/entities/Transaction.ts"
import type SimpleIndexedDB from "../database/SimpleIndexedDB.ts"
import { Money } from "../../domain/value-objects/Money.ts"
import { BaseRepository } from "../BaseRepository.ts"

export type PersistedTransaction = {
  id: string
  date: number
  type: number
  amountValue: number
  amountCurrency: number
  description: string
}

export class TransactionRepository
  extends BaseRepository<Transaction, PersistedTransaction>
  implements ITransactionRepository
{
  protected readonly STORE_NAME = "transactions"

  constructor(private readonly indexedDBInstance: SimpleIndexedDB) {
    super()
  }

  protected toPersistence(entity: Transaction): PersistedTransaction {
    return {
      id: entity.id,
      date: entity.date.getTime(),
      type: entity.type,
      amountValue: entity.amount.value,
      amountCurrency: entity.amount.currency,
      description: entity.description,
    }
  }

  protected toDomain(raw: PersistedTransaction): Transaction {
    return new Transaction(
      raw.type,
      new Money(raw.amountValue, raw.amountCurrency),
      raw.description,
      new Date(raw.date),
      raw.id,
    )
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const persistedData = await this.indexedDBInstance.save(
      this.STORE_NAME,
      this.toPersistence(transaction),
    )
    return this.toDomain(persistedData)
  }

  async findAll(): Promise<Array<Transaction>> {
    const result: Array<PersistedTransaction> = await this.indexedDBInstance.getAll(this.STORE_NAME)
    const transactions: Array<Transaction> = []

    for (const persistedTransaction of result) {
      transactions.push(this.toDomain(persistedTransaction))
    }

    return transactions
  }

  findById(id: string): Promise<Transaction | null> {
    throw new Error("Method not implemented.")
  }

  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.")
  }
}
