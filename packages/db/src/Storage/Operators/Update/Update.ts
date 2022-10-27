import type { RawObject } from "mingo/types";

import { clone } from "../../../Clone";
import { Document } from "../../Storage";
import { $pull } from "./Pull";
import { $push } from "./Push";
import { $set } from "./Set";
import { $unset } from "./Unset";

export function update<D extends Document>(criteria: RawObject, operators: UpdateOperators, document: D) {
  const updatedDocument = clone(document);

  const setModified = $set(updatedDocument, criteria, operators.$set);
  const runModified = $unset(updatedDocument, operators.$unset);
  const pushModified = $push(updatedDocument, operators.$push);
  const pullModified = $pull(updatedDocument, operators.$pull);

  return {
    modified: setModified || runModified || pushModified || pullModified,
    document: updatedDocument
  };
}

export type UpdateOperators = {
  $set?: RawObject;
  $unset?: RawObject;
  $push?: RawObject;
  $pull?: RawObject;
};
