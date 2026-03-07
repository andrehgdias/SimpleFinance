import type TransactionService from "../../application/services/TransactionService.ts"
import { createStore, type SetStoreFunction } from "solid-js/store"
import { TransactionType } from "../../domain/entities/Transaction.ts"
import { Currency } from "../../domain/value-objects/Money.ts"
import { type Accessor, createMemo, createSignal, type Setter } from "solid-js"

type TransactionFormFields = {
  type: TransactionType
  currency: Currency
  description: string
  date: string
  amount: string
}

type TransactionFormErrors = {
  fields: {
    description: string | null
    date: string | null
    amount: string | null
  }
  formError: string | null
  lastSubmitErrorMessage: string | null
}

export type TransactionFormState = { draft: TransactionFormFields; errors: TransactionFormErrors }

export type TransactionCreator = {
  createTransaction: TransactionService["createTransaction"]
}

export class TransactionFormViewModel {
  // Store for draft + errors
  readonly state: TransactionFormState
  private readonly setState: SetStoreFunction<TransactionFormState>

  // Signals/memos for booleans
  readonly isSubmitting: Accessor<boolean>
  private readonly setSubmitting: Setter<boolean>

  readonly isValid: Accessor<boolean>

  private readonly referenceDate: Date

  constructor(
    private readonly transactionCreator: TransactionCreator,
    referenceDateISO: string,
  ) {
    this.referenceDate = new Date(referenceDateISO)

    const [state, setState] = createStore<TransactionFormState>({
      draft: {
        type: TransactionType.INCOME,
        currency: Currency.EUR,
        description: "",
        date: "",
        amount: "0",
      },
      errors: {
        fields: { description: null, date: null, amount: null },
        formError: null,
        lastSubmitErrorMessage: null,
      },
    })
    this.state = state
    this.setState = setState

    this.isValid = createMemo(() => {
      const descriptionError = this.assertValidDescription()
      const dateError = this.assertValidDate()
      const amountError = this.assertValidAmount()

      const hasFieldErrors =
        this.hasErrorMessage(descriptionError) ||
        this.hasErrorMessage(dateError) ||
        this.hasErrorMessage(amountError)
      const hasFormErrors = this.hasErrorMessage(this.state.errors.formError)

      return !hasFieldErrors && !hasFormErrors
    })

    const [isSubmitting, setSubmitting] = createSignal(false)
    this.isSubmitting = isSubmitting
    this.setSubmitting = setSubmitting
  }

  setDescription(value: string) {
    this.setState("draft", "description", value)
    this.setState("errors", "fields", "description", this.assertValidDescription())
  }

  setDate(value: string) {
    this.setState("draft", "date", value)
    this.setState("errors", "fields", "date", this.assertValidDate())
  }

  setAmount(value: string) {
    this.setState("draft", "amount", value)
    this.setState("errors", "fields", "amount", this.assertValidAmount())
  }

  private hasErrorMessage(error: string | null) {
    return error !== null && error.trim() !== ""
  }

  private assertValidDescription(): string | null {
    if (this.state.draft.description.trim() === "") {
      return "Description is required"
    }
    return null
  }

  private assertValidDate(): string | null {
    const trimmed = this.state.draft.date.trim()
    if (trimmed === "") return "Date is required"

    const date = new Date(trimmed)
    if (isNaN(date.getTime())) return "Date should be valid and in ISO format (YYYY-MM-DD)"

    if (date.getTime() > this.referenceDate.getTime()) return "Date cannot be in the future"

    return null
  }

  private assertValidAmount(): string | null {
    const trimmed = this.state.draft.amount.trim()
    if (trimmed === "") return "Amount is required"

    if (isNaN(Number(trimmed))) return "Amount must be a valid number"

    const num = Number(trimmed)
    if (num <= 0) return "Amount must be greater than 0"

    return null
  }
}
