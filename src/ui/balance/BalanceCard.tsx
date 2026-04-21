import { type Component, ErrorBoundary, type Resource, Show } from "solid-js"

export type BalanceCardProps = {
  balance: Resource<number>
}

const BalanceCard: Component<BalanceCardProps> = props => {
  return (
    <ErrorBoundary fallback={<div>Error</div>}>
      <Show when={!props.balance.loading} fallback={<div>Loading...</div>}>
        <div>€{props.balance.latest}</div>
        <span>Net balance</span>
      </Show>
    </ErrorBoundary>
  )
}

export default BalanceCard
