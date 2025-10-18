export enum Currency { // TODO Support other currencies / locales
    USD
}

export class Money {
    constructor(public readonly amount: number, public readonly currency: Currency) {
        if (amount === 0) {
            throw new Error('Amount cannot be ZERO');
        }

        if (amount < 0) {
            throw new Error('Amount cannot be negative');
        }
    }

    /**
     * Format amount with 2 decimals and add commas
     */
    format(): string {
        const formattedAmount = this.amount.toLocaleString('en-US', { // TODO Support other locales
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        // Add currency symbol (only USD for now)
        return `$${formattedAmount}`;
    }
}