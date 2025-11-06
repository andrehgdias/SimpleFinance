export type StoreConfig = {
  name: string
  keyPath: string
}

export default class SimpleIndexedDB {
  private db: IDBDatabase | null = null

  constructor(
    private dbName: string,
    private version: number,
    private stores: Array<StoreConfig>,
  ) {}

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
        const db = (event.target as IDBOpenDBRequest).result

        // Create all stores defined in constructor if needed
        for (const store of this.stores) {
          if (!db.objectStoreNames.contains(store.name)) {
            db.createObjectStore(store.name, { keyPath: store.keyPath })
          }
        }
      }
    })
  }

  private getDb() {
    if (!this.db) {
      throw new Error("Database not opened. Call open() first!")
    }
    return this.db
  }

  async save<T>(objectStoreName: string, data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      const db = this.getDb()
      const transaction = db.transaction([objectStoreName], "readwrite")
      const objectStore = transaction.objectStore(objectStoreName)
      const putRequest = objectStore.put(data)
      transaction.oncomplete = () => {
        resolve(data)
      }
      transaction.onerror = () => {
        reject(putRequest.error)
      }
    })
  }

  async getAll<T>(objectStoreName: string): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      const db = this.getDb()
      const transaction = db.transaction([objectStoreName])
      const objectStore = transaction.objectStore(objectStoreName)
      const getAllrequest = objectStore.getAll()
      transaction.oncomplete = () => {
        resolve(getAllrequest.result)
      }
      transaction.onerror = () => {
        reject(getAllrequest.error)
      }
    })
  }
}

export class SimpleIndexedDBErrorWrapper extends Error {
  constructor(operation: "open", originalError: Error | null) {
    const message = originalError
      ? `Failed to ${operation} database (${originalError?.name}): ${originalError?.message}`
      : `Failed to ${operation} database: Unknown error` // Shouldn't happen, handling it just in case
    super(message)

    this.name = "SimpleIndexedDBErrorWrapper"
    this.cause = originalError
  }
}
