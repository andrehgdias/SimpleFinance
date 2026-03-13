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
import { buildTransaction, TEST_REFERENCE_DATE } from "../../../testUtils.ts"

describe("TransactionFormViewModel", async () => {
  let mockTransactionCreator: TransactionCreator
  let model: TransactionFormViewModel

  let reactivityRoot: () => void

  beforeEach(() => {
    mockTransactionCreator = { createTransaction: vi.fn() }
    reactivityRoot = createRoot(d => {
      model = new TransactionFormViewModel(mockTransactionCreator, TEST_REFERENCE_DATE)
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
        date: TEST_REFERENCE_DATE.toISOString().substring(0, 10),
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
      model.setDescription(
        "The answer to the Ultimate Question of Life, the Universe, and Everything",
      )

      expect(model.isValid()).toBe(false) // We did not set amount but it is required
    })
    it.todo("Should be false when there is a form error", () => {
      // TODO needs a testable FormViewModel
      // model.setAmount("10")
      // model.setDescription("Saturday coffee")
      // model.setDate("2026-12-13")
      //
      // model.setFormError // "Visible for test method"
      //
      // expect(model.isValid()).toBe(true)
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
      it("Should call service with mapped DTO, toggle submitting, reset on success, and return as true", async () => {
        // Arrange
        const emptyErrors: TransactionFormState["errors"] = {
          formError: null,
          lastSubmitErrorMessage: null,
          fields: {
            description: null,
            date: null,
            amount: null,
          },
        }

        model.setAmount("42")
        model.setDescription("Saturday coffee")
        model.setDate("2026-12-03")

        const dto: CreateTransactionDto = {
          value: parseFloat(model.state.draft.amount),
          currency: model.state.draft.currency,
          description: model.state.draft.description,
          date: new Date(model.state.draft.date),
          type: model.state.draft.type,
        }
        const transaction = buildTransaction(dto)

        let controlledResolve: (value: Transaction) => void
        const deferredCreationPromise = new Promise<Transaction>(
          resolve => (controlledResolve = resolve),
        )
        vi.mocked(mockTransactionCreator).createTransaction.mockReturnValue(deferredCreationPromise) // Just return the promise, do not resolve it since we want to control and simulate a delayed resolution

        // Act, Assert
        const submitPromise = model.submit() // Submit did not resolve yet,aka form hasn't complete its own submission
        expect(model.isSubmitting()).toBe(true)

        controlledResolve!(transaction) // ! needed to tell TS we have this value assigned

        const result = await submitPromise
        expect(result).toBe(true)
        expect(model.isSubmitting()).toBe(false)
        expect(mockTransactionCreator.createTransaction).toHaveBeenCalledTimes(1)
        expect(mockTransactionCreator.createTransaction).toHaveBeenCalledWith(dto)

        // Resets the draft
        expect(model.state.draft.amount).toBe("")
        expect(model.state.draft.description).toBe("")
        expect(model.state.draft.date).toBe(TEST_REFERENCE_DATE.toISOString().substring(0, 10))
        expect(model.state.draft.type).toBe(TransactionType.INCOME)
        expect(model.state.errors).toStrictEqual(emptyErrors)
      })
    })

    describe("With errors", () => {
      it("Should not call service when invalid and should expose field errors", async () => {
        model.setAmount("42")
        model.setDate("2026-12-03")
        // Missing description

        const result = await model.submit()

        expect(model.isSubmitting()).toBe(false)
        expect(result).toBe(false)
        expect(mockTransactionCreator.createTransaction).toHaveBeenCalledTimes(0)

        expect(model.isValid()).toBe(false)
        expect(model.state.errors.fields.description).toBe("Description is required")
      })

      it("Should map application/domain error into form error when service throws", async () => {
        model.setAmount("42")
        model.setDescription("Saturday coffee")
        model.setDate("2026-12-03")

        // Mock model error
        vi.mocked(mockTransactionCreator).createTransaction.mockRejectedValue(
          new Error("Model/Infrastructure error"),
        )

        const result = await model.submit()

        expect(result).toBe(false)
        expect(mockTransactionCreator.createTransaction).toHaveBeenCalledTimes(1)
        expect(model.isSubmitting()).toBe(false)
        expect(model.isValid()).toBe(false)
        expect(model.state.errors.formError).toBe("Unexpected error")
        expect(model.state.errors.lastSubmitErrorMessage).toBe("Model/Infrastructure error")
      })
    })
  })
})
