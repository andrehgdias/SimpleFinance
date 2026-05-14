import { type Component, ErrorBoundary, type Resource, Show } from "solid-js"
import styles from "./style.module.css"

export type BalanceCardProps = {
  balance: Resource<number>
}

const BalanceCard: Component<BalanceCardProps> = props => {
  return (
    <ErrorBoundary fallback={<div>Error</div>}>
      <Show when={!props.balance.loading} fallback={<div>Loading...</div>}>
        <div class={`card ${styles["balance-card-group"]}`}>
          <div class={styles["balance-card"]}>
            <span>€{props.balance.latest}</span>
            <small>Net balance</small>
          </div>
          <div class={styles["balance-card"]}>
            <span>€{props.balance.latest}</span>
            <small>Net balance</small>
          </div>
          <div class={styles["balance-card"]}>
            <span>€{props.balance.latest}</span>
            <small>Net balance</small>
          </div>
        </div>
      </Show>
    </ErrorBoundary>
  )
}

export default BalanceCard
