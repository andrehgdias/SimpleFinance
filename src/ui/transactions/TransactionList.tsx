import { type Accessor, type Component, createResource, ErrorBoundary, For, Show } from "solid-js"
import type TransactionService from "../../application/services/TransactionService.ts"

export type TransactionListProps = {
  transactionService: TransactionService
  refreshTrigger: Accessor<number>
}

const TransactionList: Component<TransactionListProps> = props => {
  const [transactions] = createResource(props.refreshTrigger, () =>
    props.transactionService.getAllTransactions(),
  )

  return (
    <ErrorBoundary fallback={<div>Error</div>}>
      <Show when={!transactions.loading} fallback={<div>Loading...</div>}>
        <ol>
          <For each={transactions.latest ?? []}>
            {transaction => (
              <li>
                {`${transaction.description} - ${transaction.type} ${transaction.amount.format()} at ${transaction.date.toLocaleString()}`}
              </li>
            )}
          </For>
        </ol>
      </Show>
    </ErrorBoundary>
  )
}

export default TransactionList
