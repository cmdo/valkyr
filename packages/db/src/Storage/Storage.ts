import { EventEmitter } from "@valkyr/utils";

import { InstanceAdapter } from "../Adapters";
import { operations } from "./Operations";
import type { Adapter, ChangeType, Document, Insert, Operation, Status, UpdateActions } from "./Types";

export class Storage extends EventEmitter<{
  loading: () => void;
  ready: () => void;
  working: () => void;
  change: (type: ChangeType, document: Document) => void;
}> {
  public readonly name: string;
  public readonly adapter: Adapter;
  public readonly documents: Map<string, Document>;
  public readonly operations: Operation[];
  public readonly debounce: {
    save?: NodeJS.Timeout;
  } = {
    save: undefined
  };

  public status: Status;

  constructor(name: string, adapter: Adapter = new InstanceAdapter()) {
    super();
    this.name = name;
    this.adapter = adapter;
    this.documents = new Map();
    this.operations = [];
    this.status = "loading";
  }

  /*
   |--------------------------------------------------------------------------------
   | Accessors
   |--------------------------------------------------------------------------------
   */

  public get data(): Document[] {
    return Array.from(this.documents.values());
  }

  /*
   |--------------------------------------------------------------------------------
   | Lookup
   |--------------------------------------------------------------------------------
   */

  public has(id: string): boolean {
    return this.documents.has(id);
  }

  /*
   |--------------------------------------------------------------------------------
   | Status
   |--------------------------------------------------------------------------------
   */

  public is(status: Status): boolean {
    return this.status === status;
  }

  private setStatus(value: Status): this {
    this.status = value;
    this.emit(value);
    return this;
  }

  /*
   |--------------------------------------------------------------------------------
   | Event Handler
   |--------------------------------------------------------------------------------
   */

  public onChange(cb: (type: ChangeType, document: Document) => void): () => void {
    this.addListener("change", cb);
    return () => {
      this.removeListener("change", cb);
    };
  }

  /*
   |--------------------------------------------------------------------------------
   | Persisters
   |--------------------------------------------------------------------------------
   */

  public async load(): Promise<this> {
    if (!this.is("loading")) {
      return this;
    }
    const documents = await this.adapter.get(this.name);
    for (const document of documents) {
      this.documents.set(document.id, document);
    }
    return this.setStatus("ready").process();
  }

  public async save(): Promise<this> {
    if (this.debounce.save) {
      clearTimeout(this.debounce.save);
    }
    this.debounce.save = setTimeout(() => {
      this.adapter.set(this.name, this.data);
    }, 500);
    return this;
  }

  public flush(): void {
    this.documents.clear();
    this.adapter.flush();
  }

  /*
   |--------------------------------------------------------------------------------
   | Mutations
   |--------------------------------------------------------------------------------
   */

  public async insert(document: Document): Promise<string> {
    return new Promise((resolve, reject) => {
      this.load().then(() => {
        this.operations.push({ type: "insert", document, resolve, reject });
        this.process();
      });
    });
  }

  public async update(id: string, actions: UpdateActions): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.load().then(() => {
        this.operations.push({ type: "update", id, actions, resolve, reject });
        this.process();
      });
    });
  }

  public async replace(id: string, document: Document): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.load().then(() => {
        this.operations.push({ type: "replace", id, document, resolve, reject });
        this.process();
      });
    });
  }

  public async delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.load().then(() => {
        this.operations.push({ type: "delete", id, resolve, reject });
        this.process();
      });
    });
  }

  /*
   |--------------------------------------------------------------------------------
   | Processor
   |--------------------------------------------------------------------------------
   */

  public async process(): Promise<this> {
    if (this.is("loading") || this.is("working")) {
      return this;
    }

    this.setStatus("working");

    const operation = this.operations.shift();
    if (!operation) {
      return this.setStatus("ready");
    }

    try {
      operation.resolve(this.resolve(operation as any));
      this.save();
    } catch (error: any) {
      operation.reject(error);
    }

    this.setStatus("ready").process();

    return this;
  }

  public resolve(operation: Insert, attempts?: number): string;
  public resolve(operation: Operation, attempts?: number): boolean;
  public resolve(operation: Operation, attempts = 0): string | boolean {
    return operations[operation.type](this, operation, attempts);
  }
}
