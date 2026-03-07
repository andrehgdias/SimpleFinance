import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  type TransactionCreator,
  type TransactionFormState,
  TransactionFormViewModel
} from "../../../../src/ui/transactions/TransactionFormViewModel.ts"
import Transaction, { TransactionType } from "../../../../src/domain/entities/Transaction.ts"
import { Currency } from "../../../../src/domain/value-objects/Money.ts"
import { createRoot } from "solid-js"
import type { CreateTransactionDto } from "../../../../src/application/services/TransactionService.ts"
import { buildTransaction } from "../../../testUtils.ts"

describe("TransactionFormViewModel", async () => {
  const REFERENCE_DATE_ISO = "2026-12-19"
  let mockTransactionCreator: TransactionCreator
  let model: TransactionFormViewModel

  let reactivityRoot: () => void

  beforeEach(() => {
    mockTransactionCreator = { createTransaction: vi.fn() }
    reactivityRoot = createRoot(d => {
      model = new TransactionFormViewModel(mockTransactionCreator, REFERENCE_DATE_ISO)
      return d
    })
  })

  afterEach(() => reactivityRoot())

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

    //Assert
    expect(model.state.draft).toStrictEqual(initialState.draft)
    expect(model.state.errors).toStrictEqual(initialState.errors)
    expect(model.isSubmitting()).toBe(initialState.isSubmitting)
    expect(model.isValid()).toBe(initialState.isValid)
  })

  describe("Validate as you type", () => {
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
      it("Should set description error when description is empty/blank", () => {
        // Arrange
        // Act
        model.setDescription("")
        // Assert
        expect(model.state.errors.fields.description).toBe("Description is required")
      })
      it("Should clear description error when description becomes valid", () => {
        // Arrange
        model.setDescription("")
        // Act
        model.setDescription("Dinner with friends")
        //Assert
        expect(model.state.errors.fields.description).toBeNull()
      })
    })

    describe("Date", () => {
      it("Should set date error when date is empty", () => {
        model.setDate("")
        expect(model.state.errors.fields.date).toBe("Date is required")
      })
      it("Should set date error when date is invalid", () => {
        model.setDate("invalid-date")
        expect(model.state.errors.fields.date).toBe(
          "Date should be valid and in ISO format (YYYY-MM-DD)",
        )
      })
      it("Should set date error when date is in the future", () => {
        model.setDate("2027-12-03")
        expect(model.state.errors.fields.date).toBe("Date cannot be in the future")
      })
      it("Should clear date error when date becomes valid", () => {
        model.setDate("2026-12-03")
        expect(model.state.errors.fields.date).toBeNull()
      })
    })
  })

  describe("isValid", () => {
    it("Should be false when not all required fields are filled", () => {
      model.setAmount("42")
      model.setDescription(
        "The answer to the Ultimate Question of Life, the Universe, and Everything",
      )

      expect(model.isValid()).toBe(false) // We did not set date but it is required
    })
    it("Should be true when all fields are valid", () => {
      model.setAmount("-100")

      model.setAmount("10")
      model.setDescription("Saturday coffee")
      model.setDate("2026-12-13")

      expect(model.isValid()).toBe(true)
    })
  })

  describe("Submit", () => {
    describe("Valid form", () => {
      it("Should call service with mapped DTO, toggle submitting, reset on success, and return as true", () => {})
    })

    describe("With errors", () => {
      it.todo("Should not call service when invalid and should expose field errors", () => {})
      it.todo("Should map application/domain error into form error when service throws", () => {})
    })
  })
})
