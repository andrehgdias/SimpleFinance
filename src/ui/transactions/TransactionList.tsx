import { type Component, createMemo, For } from "solid-js"
import type TransactionService from "../../application/services/TransactionService.ts"
import NotFoundError from "../../application/errors/NotFoundError.ts"
import Transaction, { TransactionType } from "../../domain/entities/Transaction.ts"
import styles from "./style.module.css"

export type TransactionListProps = {
  transactionService: TransactionService
  onDeleteTransaction: () => void
  transactions: Array<Transaction>
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function formatShortDate(timestamp: number) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
  return new Date(timestamp).toLocaleDateString([], options)
}

const TransactionList: Component<TransactionListProps> = props => {
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

  const transactionsMap = createMemo(() => {
    console.log(props.transactions)
    const transactionsMap: Map<number, Transaction[]> = new Map()
    for (const transaction of props.transactions) {
      const dateKey = startOfDay(transaction.date)
      const entry = transactionsMap.get(dateKey) ?? []
      entry.push(transaction)
      transactionsMap.set(dateKey, entry)
    }
    return transactionsMap
  })

  return (
    <ol class={`${styles["transaction-list"]}`}>
      <For each={Array.from(transactionsMap().keys())}>
        {date => (
          <div class={`${styles["transaction-list-date-group"]}`}>
            <header>
              <h2>{formatShortDate(date)}</h2>
            </header>

            <For each={Array.from(transactionsMap().get(date)!)}>
              {transaction => {
                let isExpense = transaction.type === TransactionType.OUTCOME
                return (
                  <li class={`card ${styles["transaction-list-item"]}`}>
                    <h1>{transaction.description}</h1>
                    <span
                      class={isExpense ? "red" : "green"}
                    >{`${isExpense ? "-" : ""}${transaction.amount.format()}`}</span>
                    <button onClick={e => handleDelete(e, transaction.id)}>X</button>
                  </li>
                )
              }}
            </For>
          </div>
        )}
      </For>
    </ol>
  )
}

export default TransactionList
