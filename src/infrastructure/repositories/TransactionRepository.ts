import type { ITransactionRepository } from "../../application/interfaces/ITransactionRepository.d.ts"
import type { Transaction } from "../../domain/entities/Transaction.ts"
import type SimpleIndexedDB from "../database/SimpleIndexedDB.ts"

export type PersistedTransaction = {
  id: string
  date: number
  type: number
  amountValue: number
  amountCurrency: number
  description: string
}

export class TransactionRepository implements ITransactionRepository {
  readonly STORE_NAME = "transactions"

  constructor(private readonly indexedDBInstance: SimpleIndexedDB) {}

  static toPersistence(instance: Transaction) {
    Array.from(Object.entries(instance)).forEach(([key, value]) => console.log({ key, value }))
    const persistedIntancePojo = {
      id: instance.id,
      date: instance.date.getTime(),
      type: instance.type,
      amountValue: instance.amount.value,
      amountCurrency: instance.amount.value,
      description: instance.description,
    }

    return persistedIntancePojo
  }
  static toInstance(pojo: object) {}

  async save(transaction: Transaction): Promise<Transaction> {
    return await this.indexedDBInstance.save(this.STORE_NAME, transaction)
  }

  async findAll(): Promise<Array<Transaction>> {
    const result: Array<PersistedTransaction> = await this.indexedDBInstance.getAll(this.STORE_NAME)
    const transactions: Array<Transaction> = []

    for (const persistedTransaction of result) {
      transactions.push(this.toInstance(persistedTransaction))
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
