import { Document } from "@valkyr/db";

import { db } from "~Services/Database";

import { addEditorNode } from "../../../Nodes/Node.Collection";
import { BlockField } from "../../Utilities/BlockFields";

export type StateBlock = Document<{
  name: string;
  data: BlockField[];
}>;

/*
 |--------------------------------------------------------------------------------
 | Helpers
 |--------------------------------------------------------------------------------
 */

export async function createStateBlock(): Promise<void> {
  const result = await db.collection("states").insertOne({
    name: "Foo",
    data: [["", "p:string"]]
  });
  if (result.acknowledged === false) {
    throw new Error("Failed to create state block");
  }
  await addEditorNode("state", result.insertedId);
}
