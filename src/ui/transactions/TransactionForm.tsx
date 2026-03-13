import styles from "./style.module.css"
import { TransactionFormViewModel } from "./TransactionFormViewModel.ts"
import TransactionService from "../../application/services/TransactionService.ts"
import type { Component, JSX } from "solid-js"
import { TransactionType } from "../../domain/entities/Transaction.ts"
import { Currency } from "../../domain/value-objects/Money.ts"

export type TransactionFormProps = {
  transactionService: TransactionService
  onCreateTransaction: () => void
}

const TransactionForm: Component<TransactionFormProps> = props => {
  const maxDate = new Date()
  const maxDateISO = maxDate.toISOString().substring(0, 10)
  const viewModel = new TransactionFormViewModel(props.transactionService, maxDate)

  const handleSetAmount: JSX.InputEventHandler<HTMLInputElement, InputEvent> = e => {
    viewModel.setAmount(e.currentTarget.value)
  }

  const handleSetDescription: JSX.InputEventHandler<HTMLInputElement, InputEvent> = e => {
    viewModel.setDescription(e.currentTarget.value)
  }

  const handleSetDate: JSX.InputEventHandler<HTMLInputElement, InputEvent> = e => {
    viewModel.setDate(e.currentTarget.value)
  }

  const handleSetType = (type: TransactionType) => {
    viewModel.setType(type)
  }

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault()
    if (await viewModel.submit()) {
      props.onCreateTransaction()
    }
  }

  return (
    <form class={styles["transaction-form"]}>
      <ol>
        <li>
          <input
            type="radio"
            name="type"
            id="income"
            onInput={() => handleSetType(TransactionType.INCOME)}
            checked={viewModel.state.draft.type === TransactionType.INCOME}
          />
          <label for="income">Income</label>
        </li>
        <li>
          <input
            type="radio"
            name="type"
            id="expense"
            onInput={() => handleSetType(TransactionType.OUTCOME)}
            checked={viewModel.state.draft.type === TransactionType.OUTCOME}
          />
          <label for="expense">Expense</label>
        </li>
      </ol>

      <div>
        <div>
          <select name="currency" id="currency" disabled>
            <option value={Currency.EUR}>EUR</option>
          </select>
        </div>
        <label for="amount">Amount</label>
        <input
          type="number"
          name="amount"
          id="amount"
          min="0"
          value={viewModel.state.draft.amount}
          onInput={handleSetAmount}
        />
        <span class={styles["field-error"]}>{viewModel.state.errors.fields.amount || ""}</span>
      </div>

      <div>
        <label for="description">Description</label>
        <input
          type="text"
          name="description"
          id="description"
          value={viewModel.state.draft.description}
          onInput={handleSetDescription}
        />
        <span class={styles["field-error"]}>{viewModel.state.errors.fields.description || ""}</span>
      </div>

      <div>
        <label for="date">Date</label>
        <input
          type="date"
          name="date"
          id="date"
          max={maxDateISO}
          value={viewModel.state.draft.date}
          onInput={handleSetDate}
        />
        <span class={styles["field-error"]}>{viewModel.state.errors.fields.date || ""}</span>
      </div>

      <div>
        <span class={styles["form-error"]}>{viewModel.state.errors.formError}</span>
        {/*TODO Remove error report below*/}
        <span class={styles["form-error"]}>{viewModel.state.errors.lastSubmitErrorMessage}</span>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!viewModel.isValid() || viewModel.isSubmitting()}
        >
          Submit
        </button>
      </div>
    </form>
  )
}

export default TransactionForm
