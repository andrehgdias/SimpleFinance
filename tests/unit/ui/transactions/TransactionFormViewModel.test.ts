import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  type TransactionCreator,
  type TransactionFormState,
  TransactionFormViewModel
} from "../../../../src/ui/transactions/TransactionFormViewModel.ts"
import { TransactionType } from "../../../../src/domain/entities/Transaction.ts"
import { Currency } from "../../../../src/domain/value-objects/Money.ts"

describe("TransactionFormViewModel", async () => {
  const NOW_STR = "2001-12-19"
  let mockTransactionCreator: TransactionCreator

  beforeEach(() => {
    mockTransactionCreator = {
      createTransaction: vi.fn(),
    }
  })

  it("Should initialize with default type/currency and empty draft/errors", () => {
    // Arrange
    const initialState: TransactionFormState & { isSubmitting: boolean; isValid: boolean } = {
      draft: {
        type: TransactionType.INCOME,
        currency: Currency.EUR,
        description: "",
        date: "",
        amount: "0",
      },
      errors: {
        fields: {
          description: null,
          date: null,
          amount: null,
        },
        formError: null,
        lastSubmitErrorMessage: null,
      },
      isSubmitting: false,
      isValid: false,
    }

    // Act
    const model = new TransactionFormViewModel(mockTransactionCreator, NOW_STR)

    //Assert
    expect(model.state.draft).toStrictEqual(initialState.draft)
    expect(model.state.errors).toStrictEqual(initialState.errors)
    expect(model.isSubmitting()).toBe(initialState.isSubmitting)
    expect(model.isValid()).toBe(initialState.isValid)
  })

  describe("Validate as you type", () => {
    let model: TransactionFormViewModel

    beforeEach(() => {
      model = new TransactionFormViewModel(mockTransactionCreator, NOW_STR)
      vi.useFakeTimers()
    })

    describe("Amount", () => {
      it("Should set amount error when amount is empty", () => {
        // Arrange
        // Act
        model.setAmount("")

        // Assert
        expect(model.state.errors.fields.amount).toBe("Amount is required")
      })

      it("Should set amount error when amount is not numeric", () => {
        // Arrange
        // Act
        model.setAmount("test")

        // Assert
        expect(model.state.errors.fields.amount).toBe("Amount must be a valid number")
      })

      it("Should set amount error when amount is <= 0", () => {
        // Arrange
        // Act
        model.setAmount("0")

        // Assert
        expect(model.state.errors.fields.amount).toBe("Amount must be greater than 0")
      })

      it("Should clear amount error when amount becomes valid", () => {
        // Arrange
        // Act
        model.setAmount("-42")
        expect(model.state.errors.fields.amount).toBeTruthy() // Has error
        model.setAmount("100")

        // Assert
        expect(model.state.errors.fields.amount).toBeNull()
      })
    })

    describe("Description", () => {
      it("Should set description error when description is empty/blank", () => {})
      it("Should clear description error when description becomes valid", () => {})
    })

    describe("Date", () => {
      it("Should set date error when date is empty", () => {})
      it("Should set date error when date is invalid", () => {})
      it("Should set date error when date is in the future", () => {})
      it("Should clear date error when date becomes valid", () => {})
    })
  })

  describe("isValid", () => {
    it("Should be false when there is any field error", () => {})
    it("Should be true when all fields are valid", () => {})
  })

  describe("Submit", () => {
    describe("Valid form", () => {
      it("Should call service with mapped DTO, toggle submitting, reset on success, and return as true", () => {})
    })

    describe("With errors", () => {
      it("Should not call service when invalid and should expose field errors", () => {})
      it("Should map application/domain error into form error when service throws", () => {})
    })
  })
})
