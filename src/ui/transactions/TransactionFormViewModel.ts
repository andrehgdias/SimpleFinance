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

  constructor(
    private readonly transactionCreator: TransactionCreator,
    private readonly now: string,
  ) {
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

    const [isSubmitting, setSubmitting] = createSignal(false)

    const isValid = createMemo(() => {
      const descriptionError = this.assertValidDescription()
      const dateError = this.assertValidDate()
      const amountError = this.assertValidAmount()

      const hasNoFieldErrors =
        !this.hasErrorMessage(descriptionError) &&
        !this.hasErrorMessage(dateError) &&
        !this.hasErrorMessage(amountError)
      const hasNoFormErrors = !this.hasErrorMessage(this.state.errors.formError)
      return hasNoFieldErrors && hasNoFormErrors
    })

    this.isSubmitting = isSubmitting
    this.setSubmitting = setSubmitting

    this.isValid = isValid
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
    // FIXME check for field validity
    return "Has error"
  }

  private assertValidDate(): string | null {
    // FIXME check for field validity
    return "Has error"
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
