import { type Component, createSignal } from "solid-js"
import Transaction, { TransactionType } from "../../../domain/entities/Transaction.ts"
import styles from "./style.module.css"

export type TransactionListItemProps = {
  transaction: Transaction
  onDelete: (e: MouseEvent, id: string) => Promise<void>
}

const TransactionListItem: Component<TransactionListItemProps> = props => {
  let isExpense = props.transaction.type === TransactionType.OUTCOME

  const buttonWidth = 100

  let isDragging = false
  let startX = 0
  let currentX = 0
  const [translationValue, setTranslationValue] = createSignal(0)

  const onPointerUp = (e: PointerEvent) => {
    isDragging = false

    const threshold = -buttonWidth * 0.7

    if (translationValue() < threshold) {
      setTranslationValue(-buttonWidth) // open state
    } else {
      setTranslationValue(0) // snap back
    }

    window.removeEventListener("pointerup", onPointerUp)
    window.removeEventListener("pointermove", onPointerMove)
  }

  const onPointerMove = (e: PointerEvent) => {
    currentX = e.clientX
    let delta = currentX - startX

    if (Math.abs(delta) > 10) {
      isDragging = true
    } else {
      return
    }

    // only allow swipe left
    if (delta > 0) {
      delta = 0
    }

    delta = Math.max(delta, -buttonWidth)
    setTranslationValue(delta)
  }

  const onPointerDown = (e: PointerEvent) => {
    startX = e.clientX

    window.addEventListener("pointerup", onPointerUp)
    window.addEventListener("pointermove", onPointerMove)
  }

  return (
    <li
      class={`card ${styles["transaction-list-item"]}`}
      onPointerDown={onPointerDown}
      style={{
        transform: `translateX(${translationValue()}px)`,
        transition: "transform 0.1s ease",
      }}
    >
      <h1>{props.transaction.description}</h1>
      <span
        class={isExpense ? "red" : "green"}
      >{`${isExpense ? "-" : ""}${props.transaction.amount.format()}`}</span>
      <button onClick={e => props.onDelete(e, props.transaction.id)}>X</button>
    </li>
  )
}

export default TransactionListItem
