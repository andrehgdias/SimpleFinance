import { type Accessor, type Component, createResource, ErrorBoundary, For, Show } from "solid-js"
import type TransactionService from "../../application/services/TransactionService.ts"
import NotFoundError from "../../application/errors/NotFoundError.ts"
import { TransactionType } from "../../domain/entities/Transaction.ts"

export type TransactionListProps = {
  transactionService: TransactionService
  refreshTrigger: Accessor<number>
  onDeleteTransaction: () => void
}

const TransactionList: Component<TransactionListProps> = props => {
  const [transactions] = createResource(props.refreshTrigger, () =>
    props.transactionService.getAllTransactions(),
  )

  const handleDelete = async (e: MouseEvent, id: string) => {
    e.preventDefault()

    try {
      await props.transactionService.deleteTransaction(id)
      props.onDeleteTransaction()
    } catch (e) {
      if (e instanceof NotFoundError) {
        console.warn("Transaction not found, refreshing list.\n\n", e)
        props.onDeleteTransaction() // Refresh anyway
      } else {
        console.error("Unexpected error deleting transaction\n\n", e)
      }
    }
  }

  return (
    <ErrorBoundary fallback={<div>Error loading transactions</div>}>
      <Show when={!transactions.loading} fallback={<div>Loading...</div>}>
        <ol>
          <For each={transactions.latest ?? []}>
            {transaction => (
              <li>
                {`${transaction.description} - ${transaction.type === TransactionType.INCOME ? "Income" : "Outcome"} ${transaction.amount.format()} at ${transaction.date.toLocaleDateString()}`}
                <button onClick={e => handleDelete(e, transaction.id)}>X</button>
              </li>
            )}
          </For>
        </ol>
      </Show>
    </ErrorBoundary>
  )
}

export default TransactionList
