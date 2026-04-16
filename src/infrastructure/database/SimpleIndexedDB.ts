export type StoreConfig = {
  name: string
  keyPath: string
  /**
   * Indexes should be named after fields from the stored data type
   */
  indexes?: Array<string>
}

/**
 * Wrapper around indexedDb to add a simple API and promises.
 *
 * @example
 * const myData = {
 *   email: "john@doe.com",
 *   name: "John",
 *   age: 12
 * }
 *
 * const ageIndexName = "age"
 *
 * ...
 *
 * const db = new SimpleIndexedDB("AppDB", 1, [{name: "users", "email", [ageIndexName]}])
 * await db.open()
 *
 * // Good to go :)
 */
export default class SimpleIndexedDB {
  private db: IDBDatabase | null = null

  constructor(
    private dbName: string,
    private version: number,
    private stores: Array<StoreConfig>,
  ) {}

  get isOpen() {
    return !!this.db
  }

  open(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new SimpleIndexedDBErrorWrapper("open", request.error!)) // How can this fail without an error?
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = event => {
        const target = event.target as IDBOpenDBRequest
        const db = target.result

        // Create all stores defined in constructor if needed
        for (const store of this.stores) {
          const idbStore = db.objectStoreNames.contains(store.name)
            ? target.transaction!.objectStore(store.name)
            : db.createObjectStore(store.name, { keyPath: store.keyPath })

          for (const indexName of store.indexes ?? []) {
            if (!idbStore.indexNames.contains(indexName)) {
              idbStore.createIndex(indexName, indexName)
            }
          }
        }
      }
    })
  }

  private getDb() {
    if (!this.isOpen) {
      throw new SimpleIndexedDBErrorWrapper(
        "getDb",
        new Error("Database not opened. Call open() first!"),
      )
    }
    return this.db as IDBDatabase
  }

  clearStore(objectStoreName: string) {
    return new Promise((resolve, reject) => {
      const db = this.getDb()
      const transaction = db.transaction([objectStoreName], "readwrite")
      const objectStore = transaction.objectStore(objectStoreName)
      const clearRequest = objectStore.clear()

      transaction.oncomplete = () => resolve(clearRequest.result)
      transaction.onerror = () => {
        reject(
          new SimpleIndexedDBErrorWrapper("clearStore", transaction.error || clearRequest.error),
        )
      }
    })
  }

  save<T>(objectStoreName: string, data: T): Promise<T>
  save<T>(objectStoreName: string, data: T[]): Promise<T[]>
  save<T>(objectStoreName: string, data: T | T[]): Promise<T | T[]> {
    return new Promise((resolve, reject) => {
      const db = this.getDb()
      const transaction = db.transaction([objectStoreName], "readwrite")
      const objectStore = transaction.objectStore(objectStoreName)

      const items = Array.isArray(data) ? data : [data]
      let putRequest: IDBRequest

      for (const item of items) {
        putRequest = objectStore.put(item)
      }

      transaction.oncomplete = () => resolve(data)
      transaction.onerror = () => {
        reject(new SimpleIndexedDBErrorWrapper("save", transaction.error || putRequest.error))
      }
    })
  }

  getAll<T>(objectStoreName: string): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      const db = this.getDb()
      const transaction = db.transaction(objectStoreName)
      const objectStore = transaction.objectStore(objectStoreName)
      const getAllRequest = objectStore.getAll()

      transaction.oncomplete = () => resolve(getAllRequest.result)
      transaction.onerror = () => {
        reject(new SimpleIndexedDBErrorWrapper("getAll", transaction.error || getAllRequest.error))
      }
    })
  }

  get<T>(objectStoreName: string, id: IDBValidKey): Promise<T> {
    return new Promise((resolve, reject) => {
      const db = this.getDb()
      const transaction = db.transaction(objectStoreName)
      const objectStore = transaction.objectStore(objectStoreName)
      const getRequest = objectStore.get(id)

      transaction.oncomplete = () => resolve(getRequest.result)
      transaction.onerror = () => {
        reject(new SimpleIndexedDBErrorWrapper("get", transaction.error || getRequest.error))
      }
    })
  }

  getAllFromIndex<T>(
    objectStoreName: string,
    indexName: string,
    direction: IDBCursorDirection = "next",
  ): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      const db = this.getDb()

      const transaction = db.transaction(objectStoreName)
      const objectStore = transaction.objectStore(objectStoreName)
      const index = objectStore.index(indexName)
      const cursorRequest = index.openCursor(null, direction)

      const result: Array<T> = []

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result
        if (cursor) {
          // cursor.value contains the current record being iterated through
          result.push((cursor as IDBCursorWithValue).value)
          cursor.continue()
        } else {
          resolve(result)
        }
      }
      transaction.onerror = () => {
        reject(
          new SimpleIndexedDBErrorWrapper(
            "getAllFromIndex",
            transaction.error || cursorRequest.error,
          ),
        )
      }
    })
  }

  delete(objectStoreName: string, id: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.getDb()
      const transaction = db.transaction(objectStoreName, "readwrite")
      const objectStore = transaction.objectStore(objectStoreName)
      const deleteRequest = objectStore.delete(id)

      transaction.oncomplete = () => resolve(deleteRequest.result)
      transaction.onerror = () => {
        reject(new SimpleIndexedDBErrorWrapper("delete", transaction.error || deleteRequest.error))
      }
    })
  }
}

export class SimpleIndexedDBErrorWrapper extends Error {
  constructor(
    operation:
      | "getDb"
      | "open"
      | "save"
      | "getAll"
      | "clearStore"
      | "get"
      | "delete"
      | "getAllFromIndex",
    originalError: Error | null,
  ) {
    const message = originalError
      ? `Failed to execute '${operation}' operation (${originalError?.name}): ${originalError?.message}`
      : `Failed to execute '${operation}' operation: Unknown error` // Shouldn't happen, handling it just in case
    super(message)

    this.name = "SimpleIndexedDBErrorWrapper"
    this.cause = originalError
  }
}
