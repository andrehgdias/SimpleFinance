import type {Money} from "../value-objects/Money.ts";

export enum TransactionType {
    INCOME,
    OUTCOME,
}

export class Transaction {
    // TODO makes id auto generated
    constructor(public readonly id: string, public type: TransactionType, public amount: Money, public description: string, public date: Date) {
        if(!description || description.trim() === "") {
            throw new Error("Description is required")
        }

        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        // Validate date is not in the future
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (transactionDate > today) {
            throw new Error('Transaction date cannot be in the future');
        }
    }
}