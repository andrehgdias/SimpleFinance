import styles from "./style.module.css"
import { TransactionFormViewModel } from "./TransactionFormViewModel.ts"
import TransactionService from "../../application/services/TransactionService.ts"
import type { Component, JSX } from "solid-js"

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

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault()
    if (await viewModel.submit()) {
      props.onCreateTransaction()
    }
  }

  return (
    <form class={styles["transaction-form"]}>
      <label for="amount">Amount</label>
      <input
        type="number"
        name="amount"
        id="amount"
        min="0"
        value={viewModel.state.draft.amount}
        onInput={handleSetAmount}
      />

      <label for="description">Description</label>
      <input
        type="text"
        name="description"
        id="description"
        value={viewModel.state.draft.description}
        onInput={handleSetDescription}
      />

      <label for="date">Date</label>
      <input
        type="date"
        name="date"
        id="date"
        max={maxDateISO}
        value={viewModel.state.draft.date}
        onInput={handleSetDate}
      />

      <button type="submit" onClick={handleSubmit}>
        Submit
      </button>
    </form>
  )
}

export default TransactionForm
