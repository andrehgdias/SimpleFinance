import { type Accessor, type Component, createResource, ErrorBoundary, Show } from "solid-js"
import TransactionService from "../../application/services/TransactionService.ts"

export type BalanceCardProps = {
  transactionService: TransactionService
  refreshTrigger: Accessor<number>
}

const BalanceCard: Component<BalanceCardProps> = props => {
  const [balance] = createResource(props.refreshTrigger, () =>
    props.transactionService.getBalance(),
  )
  return (
    <ErrorBoundary fallback={<div>Error</div>}>
      <Show when={!balance.loading} fallback={<div>Loading...</div>}>
        <div>€{balance.latest}</div>
        <span>Net balance</span>
      </Show>
    </ErrorBoundary>
  )
}

export default BalanceCard
