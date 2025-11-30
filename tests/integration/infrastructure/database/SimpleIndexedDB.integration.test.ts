import { afterEach, beforeEach, describe, expect, it } from "vitest"
import SimpleIndexedDB, {
  SimpleIndexedDBErrorWrapper,
  type StoreConfig,
} from "../../../../src/infrastructure/database/SimpleIndexedDB.ts"

import "fake-indexeddb/auto" // Allow testing indexedDb at a nodejs environment

describe("SimpleIndexedDB - Integration Tests", () => {
  const TEST_DB_NAME = "TestDB"
  const TEST_DB_VERSION = 1
  const STORE_TEST_NAME = "StoreTest"
  const createTestData = testDataFactory()

  let indexedDbInstance: SimpleIndexedDB

  beforeEach(async function () {
    indexedDbInstance = new SimpleIndexedDB(TEST_DB_NAME, TEST_DB_VERSION, [
      { name: STORE_TEST_NAME, keyPath: "id" },
    ])
    await indexedDbInstance.open()
  })

  afterEach(async function () {
    if (indexedDbInstance.isOpen) {
      await indexedDbInstance.clearStore(STORE_TEST_NAME)
    }
  })

  describe("Throws", function () {
    it("Should throw error when trying to use DB without opening database first", async function () {
      indexedDbInstance = new SimpleIndexedDB(TEST_DB_NAME, TEST_DB_VERSION, [
        { name: STORE_TEST_NAME, keyPath: "id" },
      ])

      await expect(indexedDbInstance.save(STORE_TEST_NAME, createTestData())).rejects.toThrowError(
        SimpleIndexedDBErrorWrapper,
      )
    })
  })

  it("Should open a database connection", async function () {
    // Arrange
    const stores: Array<StoreConfig> = [{ name: STORE_TEST_NAME, keyPath: "id" }]
    const db = new SimpleIndexedDB(TEST_DB_NAME, TEST_DB_VERSION, stores)

    // Act, Assert
    await expect(db.open()).resolves.toBeUndefined()
  })

  it("Should save data to storage", async function () {
    await indexedDbInstance.open()
    const dataToPersist = createTestData()

    const data = await indexedDbInstance.save(STORE_TEST_NAME, dataToPersist)

    expect(data).toBe(dataToPersist)
  })

  it("Should retrieve all data from storage", async function () {
    // Arrange
    const data = [createTestData(), createTestData()]
    await indexedDbInstance.save(STORE_TEST_NAME, data)

    // Act
    const allData = await indexedDbInstance.getAll(STORE_TEST_NAME)

    // Assert
    expect(allData).toStrictEqual(data)
  })

  it("Should save all data from different save operations without overwriting any data", async function () {
    // Arrange
    const data = [createTestData(), createTestData()]
    await indexedDbInstance.save(STORE_TEST_NAME, data)
    let newData = createTestData()
    await indexedDbInstance.save(STORE_TEST_NAME, newData)

    // Act
    const allData = await indexedDbInstance.getAll(STORE_TEST_NAME)

    // Assert
    expect(allData).toStrictEqual([...data, newData])
  })
})

type TestData = {
  id: number
  text: string
}
function testDataFactory(): () => TestData {
  let id = 1

  return function () {
    return { id: id++, text: "My test data" }
  }
}
