import type { Transaction } from "../../domain/entities/Transaction.ts"

/**
 * Repository / persistence port for transactions.
 * The infrastructure layer should implement these methods.
 */
export interface ITransactionRepository {
  save(transaction: Transaction): Promise<Transaction>
  findAll(): Promise<Array<Transaction>>
  findById(id: string): Promise<Transaction | null>
  delete(id: string): Promise<void>
}
