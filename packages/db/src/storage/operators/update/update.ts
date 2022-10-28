import type { RawObject } from "mingo/types";

import { clone } from "../../../clone";
import { Document } from "../../storage";
import { $inc } from "./inc";
import { $pull } from "./pull";
import { $push } from "./push";
import { $set } from "./set";
import { $unset } from "./unset";

export function update<D extends Document>(criteria: RawObject, operators: UpdateOperators, document: D) {
  const updatedDocument = clone(document);

  const setModified = $set(updatedDocument, criteria, operators.$set);
  const runModified = $unset(updatedDocument, operators.$unset);
  const pushModified = $push(updatedDocument, operators.$push);
  const pullModified = $pull(updatedDocument, operators.$pull);
  const incModified = $inc(updatedDocument, criteria, operators.$inc);

  return {
    modified: setModified || runModified || pushModified || pullModified || incModified,
    document: updatedDocument
  };
}

export type UpdateOperators = {
  $set?: RawObject;
  $unset?: RawObject;
  $push?: RawObject;
  $pull?: RawObject;
  $inc?: {
    [keyPath: string]: number;
  };
};
