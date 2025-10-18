import type {TransactionType} from "../../domain/entities/Transaction.ts";
import type {Currency} from "../../domain/value-objects/Money.ts";

export type CreateTransactionDto = {
    type: TransactionType;
    amount: number;
    currency: Currency;
    description: string;
    date: Date;
}