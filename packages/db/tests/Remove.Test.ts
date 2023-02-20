import { MemoryStorage } from "../src/Databases/MemoryDb.Storage.js";
import { Collection, RemoveResult } from "../src/index.js";
import { users } from "./Users.Mock.js";

/*
 |--------------------------------------------------------------------------------
 | Unit Tests
 |--------------------------------------------------------------------------------
 */

describe("Storage Remove", () => {
  it("should successfully delete document", async () => {
    const collection = new Collection("users", new MemoryStorage("users"));
    await collection.insertMany(users);
    expect(await collection.remove({ id: "user-1" })).toEqual(new RemoveResult(1));
  });
});
