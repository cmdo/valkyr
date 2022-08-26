import { RawObject } from "mingo/types";

import type { Document, Storage } from "./Storage";

export class DuplicateDocumentError extends Error {
  readonly type = "DuplicateDocumentError";

  constructor(readonly document: Document, storage: Storage) {
    super(
      `Collection Insert Violation: Document '${document.id}' already exists in ${storage.name} ${storage.adapter.type} ${storage.id}`
    );
  }
}

export class DocumentNotFoundError extends Error {
  readonly type = "DocumentNotFoundError";

  constructor(readonly criteria: RawObject) {
    super(`Collection Update Violation: Document matching criteria does not exists`);
  }
}

export class PullUpdateArrayError extends Error {
  readonly type = "PullUpdateArrayError";

  constructor(document: string, key: string) {
    super(`Collection Update Violation: Document '${document}' $pull operation failed, '${key}' is not an array`);
  }
}
