import { type Component, createSignal, onMount, Show } from "solid-js"
import TransactionForm from "./transactions/TransactionForm.tsx"
import TransactionService from "../application/services/TransactionService.ts"
import TransactionRepository from "../infrastructure/repositories/TransactionRepository.ts"
import SimpleIndexedDB, { type StoreConfig } from "../infrastructure/database/SimpleIndexedDB.ts"
import TransactionList from "./transactions/TransactionList.tsx"
import BalanceCard from "./balance/BalanceCard.tsx"

const DB_NAME = "SimpleFinanceDB"
const DB_VERSION = 1
const DB_STORES: Array<StoreConfig> = [{ name: "transactions", keyPath: "id" }]

const App: Component = () => {
  const indexedDb = new SimpleIndexedDB(DB_NAME, DB_VERSION, DB_STORES)
  const transactionRepository = new TransactionRepository(indexedDb)
  const transactionService = new TransactionService(transactionRepository, new Date())

  const [isDbOpen, setIsDbOpen] = createSignal(false)
  const [refreshTrigger, setRefreshTrigger] = createSignal(0)

  onMount(async () => {
    await indexedDb.open()
    setIsDbOpen(indexedDb.isOpen)
  })

  return (
    <div>
      <section>
        <h1>Simple. Finance</h1>
        <h2>Transactions</h2>
        <Show when={isDbOpen()} fallback={<div>Loading...</div>}>
          <BalanceCard transactionService={transactionService} refreshTrigger={refreshTrigger} />
        </Show>
      </section>
      <Show when={isDbOpen()} fallback={<div>Loading...</div>}>
        <TransactionForm
          transactionService={transactionService}
          onCreateTransaction={() => setRefreshTrigger(prev => prev + 1)}
        />
        <hr />
        <TransactionList transactionService={transactionService} refreshTrigger={refreshTrigger} />
      </Show>
    </div>
  )
}
export default App
