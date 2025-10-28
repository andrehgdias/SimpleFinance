import { describe, expect, it } from "vitest"
import SimpleIndexedDB, {
  type StoreConfig,
} from "../../../../src/infrastructure/database/SimpleIndexedDB"

import "fake-indexeddb/auto" // Allow testing indexedDb at a nodejs environment

describe("SimpleIndexedDB", () => {
  const TEST_DB_NAME = "TestDB"
  const TEST_DB_VERSION = 1

  it("Should create a SimpleIndexedDB instance", async () => {
    // Arrange
    const stores: Array<StoreConfig> = [{ name: "StoreTest", keyPath: "id" }]

    // Act
    const db = new SimpleIndexedDB(TEST_DB_NAME, TEST_DB_VERSION, stores)

    // Assert
    expect(db).toBeInstanceOf(SimpleIndexedDB)
  })

  it("Should open a database connection", async () => {
    // Arrange
    const stores: Array<StoreConfig> = [{ name: "StoreTest", keyPath: "id" }]
    const db = new SimpleIndexedDB(TEST_DB_NAME, TEST_DB_VERSION, stores)

    // Act, Assert
    await expect(db.open()).resolves.toBeUndefined()
  })
})
