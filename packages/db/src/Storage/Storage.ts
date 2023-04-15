import { Cursor } from "mingo/cursor";
import { RawObject } from "mingo/types";
import { nanoid } from "nanoid";
import { Subject } from "rxjs";

import { BroadcastChannel, StorageBroadcast } from "../Broadcast.js";
import { InsertManyResult, InsertOneResult } from "./Operators/Insert/mod.js";
import { RemoveResult } from "./Operators/Remove/mod.js";
import { UpdateOperators, UpdateResult } from "./Operators/Update/mod.js";

export abstract class Storage<D extends Document = Document> {
  readonly observable = {
    change: new Subject<ChangeEvent>(),
    flush: new Subject<void>()
  };

  status: Status = "loading";

  readonly #channel = new BroadcastChannel(`valkyr:db:${this.name}`);

  constructor(readonly name: string, readonly id = nanoid()) {
    this.#channel.onmessage = ({ data }: MessageEvent<StorageBroadcast<D>>) => {
      if (data.name !== this.name) {
        return;
      }
      switch (data.type) {
        case "flush": {
          this.observable.flush.next();
          break;
        }
        default: {
          this.observable.change.next(data);
          break;
        }
      }
    };
  }

  /*
   |--------------------------------------------------------------------------------
   | Resolver
   |--------------------------------------------------------------------------------
   */

  abstract resolve(): Promise<this>;

  /*
   |--------------------------------------------------------------------------------
   | Status
   |--------------------------------------------------------------------------------
   */

  is(status: Status): boolean {
    return this.status === status;
  }

  /*
   |--------------------------------------------------------------------------------
   | Broadcaster
   |--------------------------------------------------------------------------------
   |
   | Broadcast local changes with any change listeners in the current and other
   | browser tabs and window.
   |
   */

  broadcast(type: StorageBroadcast<D>["type"], data?: D | D[]): void {
    switch (type) {
      case "flush": {
        this.observable.flush.next();
        break;
      }
      default: {
        this.observable.change.next({ type, data: data as any });
        break;
      }
    }
    this.#channel.postMessage({ name: this.name, type, data });
  }

  /*
   |--------------------------------------------------------------------------------
   | Operations
   |--------------------------------------------------------------------------------
   */

  abstract has(id: string): Promise<boolean>;

  abstract insertOne(document: PartialDocument<D>): Promise<InsertOneResult>;

  abstract insertMany(documents: PartialDocument<D>[]): Promise<InsertManyResult>;

  abstract findById(id: string): Promise<D | undefined>;

  abstract find(criteria?: RawObject, options?: Options): Promise<D[]>;

  abstract updateOne(criteria: RawObject, operators: UpdateOperators): Promise<UpdateResult>;

  abstract updateMany(criteria: RawObject, operators: UpdateOperators): Promise<UpdateResult>;

  abstract replace(criteria: RawObject, document: Document): Promise<UpdateResult>;

  abstract remove(criteria: RawObject): Promise<RemoveResult>;

  abstract count(criteria?: RawObject): Promise<number>;

  abstract flush(): Promise<void>;

  /*
   |--------------------------------------------------------------------------------
   | Destructor
   |--------------------------------------------------------------------------------
   */

  destroy() {
    this.#channel.close();
  }
}

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

export function addOptions(cursor: Cursor, options: Options): Cursor {
  if (options.sort) {
    cursor.sort(options.sort);
  }
  if (options.skip !== undefined) {
    cursor.skip(options.skip);
  }
  if (options.limit !== undefined) {
    cursor.limit(options.limit);
  }
  return cursor;
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type Document<Properties extends RawObject = RawObject> = {
  id: string;
} & Properties & {
    $meta: DocumentMeta;
  };

export type DocumentMeta = {
  createdAt: number;
  updatedAt: number;
};

export type PartialDocument<D extends Document> = Omit<D, "id" | "$meta"> & {
  id?: string;
};

type Status = "loading" | "ready";

export type ChangeEvent =
  | {
      type: "insertOne" | "updateOne";
      data: Document<any>;
    }
  | {
      type: "insertMany" | "updateMany" | "remove";
      data: Document<any>[];
    };

export type Options = {
  sort?: {
    [key: string]: 1 | -1;
  };
  skip?: number;
  range?: {
    from: string;
    to: string;
  };
  offset?: {
    value: string;
    direction: 1 | -1;
  };
  limit?: number;
  index?: Index;
};

export type Index = {
  [index: string]: any;
};
