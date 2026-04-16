import { afterEach, beforeEach, describe, expect, it } from "vitest"
import SimpleIndexedDB, {
  SimpleIndexedDBErrorWrapper,
  type StoreConfig
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
      { name: STORE_TEST_NAME, keyPath: "id", indexes: ["text"] },
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

  it("Should retrieve all data from index, ordered ascending by default", async function () {
    const data = [
      createTestData("C Item"),
      createTestData("B Item"),
      createTestData("C Item"),
      createTestData("A Item"),
      createTestData("BB Item"),
    ]
    await indexedDbInstance.save(STORE_TEST_NAME, data)
    const ascendingData = data.sort((a, b) => a.text.localeCompare(b.text))

    const result = await indexedDbInstance.getAllFromIndex<TestData>(STORE_TEST_NAME, "text")

    expect(result).toStrictEqual(ascendingData)
  })

  it("Should retrieve all data from index in descending order", async function () {
    const data = [
      createTestData("C Item"),
      createTestData("B Item"),
      createTestData("C Item"),
      createTestData("A Item"),
      createTestData("BB Item"),
    ]
    await indexedDbInstance.save(STORE_TEST_NAME, data)
    const descendingData = data.sort((a, b) => b.text.localeCompare(a.text))
    // We have to swap their positions because IndexedDB order both the index value and ids, so when we recover in descending order the ids are also ordered.
    const aux = descendingData[0]
    descendingData[0] = descendingData[1]
    descendingData[1] = aux

    const result = await indexedDbInstance.getAllFromIndex<TestData>(
      STORE_TEST_NAME,
      "text",
      "prev",
    )

    expect(result).toStrictEqual(descendingData)
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

  it("Should delete provided entity from storage and keep the rest untouched", async function () {
    const originalData = [createTestData(), createTestData()]
    await indexedDbInstance.save(STORE_TEST_NAME, originalData)
    const targetDataId = originalData[0].id

    await expect(indexedDbInstance.delete(STORE_TEST_NAME, targetDataId)).resolves.toBeUndefined()

    const remainingData = await indexedDbInstance.getAll<TestData>(STORE_TEST_NAME)
    expect(remainingData.length).toBe(1)
    expect(remainingData[0].id).toBe(originalData[1].id)
  })

  it("Not found data should return void", async function () {
    const originalData = [createTestData(), createTestData()]
    await indexedDbInstance.save(STORE_TEST_NAME, originalData)

    await expect(
      indexedDbInstance.delete(STORE_TEST_NAME, "unknownDataId"),
    ).resolves.toBeUndefined()

    const remainingData = await indexedDbInstance.getAll<TestData>(STORE_TEST_NAME)
    expect(remainingData.length).toBe(2)
  })
})

type TestData = {
  id: number
  text: string
}
function testDataFactory(): (title?: string) => TestData {
  let id = 1

  return function (title?: string): TestData {
    let testDate: TestData = { id, text: title ?? `Title ${id} test data` }
    id++
    return testDate
  }
}
