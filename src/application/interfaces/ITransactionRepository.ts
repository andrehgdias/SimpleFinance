import type {Transaction} from "../../domain/entities/Transaction.ts";

export interface ITransactionRepository {
    save(transaction: Transaction): Promise<Transaction>;
}