import {describe, expect, it} from "vitest";
import {Currency, Money} from "../../../../src/domain/value-objects/Money";
import {Transaction, TransactionType} from "../../../../src/domain/entities/Transaction";

describe("Transaction Entity", () => {
    it('Should create a valid transaction of type income', () => {
        // Arrange
        const type = TransactionType.INCOME
        const amount = new Money(1500, Currency.USD)
        const description = "Salary"
        const date = new Date()

        // Act
        const transaction = new Transaction(type, amount, description, date)

        // Assert
        expect(transaction.id).toBeTypeOf("string")
        expect(transaction.id).toBeTruthy()
        expect(transaction.type).toBe(TransactionType.INCOME)
        expect(transaction.amount).toBe(amount)
        expect(transaction.description).toBe(description)
        expect(transaction.date).toBe(date)
    })

    it('Should create a valid transaction of type outcome', () => {
        // Arrange
        const type = TransactionType.OUTCOME
        const amount = new Money(300, Currency.USD)
        const description = "Brother Gift"
        const date = new Date()

        // Act
        const transaction = new Transaction(type, amount, description, date)

        // Assert
        expect(transaction.id).toBeTypeOf("string")
        expect(transaction.id).toBeTruthy()
        expect(transaction.type).toBe(TransactionType.OUTCOME)
        expect(transaction.amount).toBe(amount)
        expect(transaction.description).toBe(description)
        expect(transaction.date).toBe(date)
    })

    it('Should not allow empty description', () => {
            // Arrange
            const type = TransactionType.INCOME
            const amount = new Money(1500, Currency.USD)
            const description = " "
            const date = new Date()

            // Act
            expect(() => new Transaction(type, amount, description, date)).toThrow("Description is required")
    })

    it('Should not allow future date', () => {
        // Arrange
        const type = TransactionType.INCOME
        const amount = new Money(1500, Currency.USD)
        const description = "Next month Salary"
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Act, Assert
        expect(() => new Transaction(type, amount, description, tomorrow)).toThrow("Transaction date cannot be in the future")
    })

    it('Should not allow invalid date', () => {
        // Arrange
        const amount = new Money(100, Currency.USD);
        const type = TransactionType.INCOME;
        const invalidDate = new Date('invalid');

        // Act, Assert
        expect(() => {
            new Transaction(type, amount, 'Salary', invalidDate);
        }).toThrow('Invalid date');
    })
})