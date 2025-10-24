import type {Money} from "../value-objects/Money.ts";

export enum TransactionType {
    INCOME,
    OUTCOME,
}

export class Transaction {
    public readonly id: string
    private _date: Date

    constructor(public type: TransactionType, public amount: Money, public description: string, date: Date) {
        this.id = crypto.randomUUID()

        if(!description || description.trim() === "") {
            throw new Error("Description is required")
        }

        this._date = this.assertDate(date);
    }

    get date(): Date {
        return this._date;
    }

    set date(value: Date) {
        this._date = this.assertDate(value);
    }

    private assertDate(date: Date) {
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

        return date
    }
}