import { type Component } from "solid-js"
import styles from "./style.module.css"

export type BalanceCardProps = {
  income: number
  expenses: number
  netBalance: number
}

const BalanceCard: Component<BalanceCardProps> = props => {
  return (
    <div class={`card ${styles["balance-card-group"]}`}>
      <div class={`${styles["balance-card"]} ${styles.green}`}>
        <span>€{props.income}</span>
        <small>Income</small>
      </div>
      <div class={`${styles["balance-card"]} ${styles.red}`}>
        <span>€{props.expenses}</span>
        <small>Expenses</small>
      </div>
      <div class={`${styles["balance-card"]}`}>
        <span class={props.netBalance >= 0 ? "green" : "red"}>
          {props.netBalance >= 0 ? "+" : "-"}€{Math.abs(props.netBalance)}
        </span>
        <small>Net balance</small>
      </div>
    </div>
  )
}

export default BalanceCard
