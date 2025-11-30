import { describe, expect, it } from "vitest"
import SimpleIndexedDB, {
  SimpleIndexedDBErrorWrapper,
  type StoreConfig,
} from "../../../../src/infrastructure/database/SimpleIndexedDB.ts"

import "fake-indexeddb/auto" // Allow testing indexedDb at a nodejs environment

describe("SimpleIndexedDB - Integration Tests", () => {
  const TEST_DB_NAME = "TestDB"
  const TEST_DB_VERSION = 1

  describe("Throws", function () {
    it("Should throw error when trying to use DB without opening database first", async () => {
      const indexedDBInstance = new SimpleIndexedDB(TEST_DB_NAME, TEST_DB_VERSION, [
        { name: "StoreTest", keyPath: "id" },
      ])

      await expect(indexedDBInstance.save("StoreTest", "testing data")).rejects.toThrowError(
        SimpleIndexedDBErrorWrapper,
      )
    })
  })

  it("Should open a database connection", async () => {
    // Arrange
    const stores: Array<StoreConfig> = [{ name: "StoreTest", keyPath: "id" }]
    const db = new SimpleIndexedDB(TEST_DB_NAME, TEST_DB_VERSION, stores)

    // Act, Assert
    await expect(db.open()).resolves.toBeUndefined()
  })
})
