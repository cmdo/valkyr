import { IndexedDbCache } from "../src/Databases/IndexedDb.Cache.js";
import { Document, Options } from "../src/index.js";

describe("IndexedDbCache", () => {
  let cache: IndexedDbCache;

  beforeEach(() => {
    cache = new IndexedDbCache();
  });

  afterEach(() => {
    cache.flush();
  });

  const sampleDocuments: Document<{ name: string }>[] = [
    { id: "doc1", name: "Document 1", $meta: { createdAt: Date.now(), updatedAt: Date.now() } },
    { id: "doc2", name: "Document 2", $meta: { createdAt: Date.now(), updatedAt: Date.now() } }
  ];

  const sampleCriteria = { name: { $eq: "Document 1" } };
  const sampleOptions: Options = { sort: { name: 1 } };

  test("hash", () => {
    const hashCode = cache.hash(sampleCriteria, sampleOptions);
    expect(typeof hashCode).toBe("number");
  });

  test("set and get", () => {
    const hashCode = cache.hash(sampleCriteria, sampleOptions);
    cache.set(hashCode, sampleDocuments);
    const result = cache.get(hashCode);
    expect(result).toEqual(sampleDocuments);
  });

  test("get undefined", () => {
    const hashCode = cache.hash(sampleCriteria, sampleOptions);
    const result = cache.get(hashCode);
    expect(result).toBeUndefined();
  });

  test("flush", () => {
    const hashCode = cache.hash(sampleCriteria, sampleOptions);
    cache.set(hashCode, sampleDocuments);
    cache.flush();
    const result = cache.get(hashCode);
    expect(result).toBeUndefined();
  });
});
