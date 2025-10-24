import {describe, expect, it} from "vitest";
import {Currency, Money} from "../../../../src/domain/value-objects/Money";

describe("Money Value Object", () => {
    it("Should create money with amount and currency", () => {
        // Arrange
        const money = new Money(100, Currency.USD)

        // Act, Assert
        expect(money.value).toBe(100)
        expect(money.currency).toBe(Currency.USD)
    })

    it("Should not allow negative amount", () => {
        // Arrange, Act, Assert
        expect(() => new Money(-42, Currency.USD)).toThrow("Value cannot be negative")
    })

    it("Should not allow amount 0", () => {
        // Arrange, Act, Assert
        expect(() => new Money(0, Currency.USD)).toThrow("Value cannot be ZERO")
    })

    it('Should format money with currency symbol', () => {
        // Arrange
        const money = new Money(1234.56, Currency.USD);

        // Act
        const formatted = money.format();

        // Assert
        expect(formatted).toBe('$1,234.56');
    })
})