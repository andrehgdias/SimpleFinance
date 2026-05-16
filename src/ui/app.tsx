import {
  type Component,
  createResource,
  createSignal,
  ErrorBoundary,
  onMount,
  Show,
} from "solid-js"
import TransactionForm from "./transactions/form/TransactionForm.tsx"
import TransactionService from "../application/services/TransactionService.ts"
import TransactionRepository from "../infrastructure/repositories/TransactionRepository.ts"
import SimpleIndexedDB, { type StoreConfig } from "../infrastructure/database/SimpleIndexedDB.ts"
import TransactionList from "./transactions/TransactionList.tsx"
import BalanceCard from "./balance/BalanceCard.tsx"
import { SortingOrder } from "../application/interfaces/ITransactionRepository.ts"

const DB_NAME = "SimpleFinanceDB"
const DB_VERSION = 2
const DB_STORES: Array<StoreConfig> = [{ name: "transactions", keyPath: "id", indexes: ["date"] }]

const App: Component = () => {
  const indexedDb = new SimpleIndexedDB(DB_NAME, DB_VERSION, DB_STORES)
  const transactionRepository = new TransactionRepository(indexedDb)
  const transactionService = new TransactionService(transactionRepository, new Date())

  const [isDbOpen, setIsDbOpen] = createSignal(false)

  const [refreshTrigger, setRefreshTrigger] = createSignal(0)
  const handleRefresh = () => setRefreshTrigger(prev => prev + 1)

  const [sortTransactionListBy, setSortTransactionListBy] = createSignal(SortingOrder.DESC)

  const [transactions] = createResource(
    () =>
      isDbOpen() ? { forceRefresh: refreshTrigger(), sortingOrder: sortTransactionListBy() } : null,
    async ({ sortingOrder }) =>
      await transactionService.getAllTransactions({ direction: sortingOrder }),
  )

  const [balanceBreakdown] = createResource(
    () => (isDbOpen() ? refreshTrigger() : null),
    async () => {
      const breakdown = await transactionService.loadIncomeExpenseBreakdown()
      return {
        income: breakdown.income,
        expenses: breakdown.expenses,
        netBalance: breakdown.income - breakdown.expenses,
      }
    },
  )

  onMount(async () => {
    await indexedDb.open()
    setIsDbOpen(indexedDb.isOpen)
  })

  return (
    <main>
      <header>
        <div class="card">
          <h1 class="app-name">Simple. Finance</h1>
          <h2 class="module-name">Transactions</h2>
        </div>
        <Show when={isDbOpen()} fallback={<div>Loading...</div>}>
          <ErrorBoundary fallback={<div>Error</div>}>
            <Show when={!balanceBreakdown.loading} fallback={<div>Loading...</div>}>
              <BalanceCard
                income={balanceBreakdown.latest!.income}
                expenses={balanceBreakdown.latest!.expenses}
                netBalance={balanceBreakdown.latest!.netBalance}
              />
            </Show>
          </ErrorBoundary>
        </Show>
      </header>

      <Show when={isDbOpen()} fallback={<div>Loading...</div>}>
        <TransactionForm
          transactionService={transactionService}
          onCreateTransaction={handleRefresh}
        />
        <hr />
        <section>
          <div>
            <label for="order-by">Order by</label>
            <select
              id="order-By"
              value={sortTransactionListBy()}
              onChange={e =>
                setSortTransactionListBy(
                  e.target.value === SortingOrder.ASC ? SortingOrder.ASC : SortingOrder.DESC,
                )
              }
            >
              <option value={SortingOrder.DESC}>Newest first</option>
              <option value={SortingOrder.ASC}>Oldest first</option>
            </select>
          </div>
        </section>

        <hr />

        <ErrorBoundary fallback={<div>Error loading transactions</div>}>
          <Show when={!transactions.loading} fallback={<div>Loading...</div>}>
            <TransactionList
              transactions={transactions.latest ?? []}
              transactionService={transactionService}
              onDeleteTransaction={handleRefresh}
            />
          </Show>
        </ErrorBoundary>
      </Show>
    </main>
  )
}
export default App
