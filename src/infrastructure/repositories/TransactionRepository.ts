import type { ITransactionRepository } from "../../application/interfaces/ITransactionRepository.ts"
import type { Transaction } from "../../domain/entities/Transaction.ts"
import type SimpleIndexedDB from "../database/SimpleIndexedDB.ts"

export class TransactionRepository implements ITransactionRepository {
  readonly STORE_NAME = "transactions"

  constructor(private readonly indexedDBInstance: SimpleIndexedDB) {}

  async save(transaction: Transaction): Promise<Transaction> {
    return await this.indexedDBInstance.save(this.STORE_NAME, transaction)
  }

  async findAll(): Promise<Array<Transaction>> {
    const result: Array<Transaction> = await this.indexedDBInstance.getAll(this.STORE_NAME)
    const transactions: Array<Transaction> = []

    for (const persistedTransaction of result) {
      transactions.push(new Transaction(...persistedTransaction))
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
