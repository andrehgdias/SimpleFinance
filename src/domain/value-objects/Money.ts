export enum Currency { // TODO Support other currencies / locales
    USD
}

export class Money {
    constructor(public readonly value: number, public readonly currency: Currency) {
        if (value === 0) {
            throw new Error('Value cannot be ZERO');
        }

        if (value < 0) {
            throw new Error('Value cannot be negative');
        }
    }

    /**
     * Format amount with 2 decimals and add commas
     */
    format(): string {
        const formattedAmount = this.value.toLocaleString('en-US', { // TODO Support other locales
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        // Add currency symbol (only USD for now)
        return `$${formattedAmount}`;
    }
}