import { Node } from "reactflow";

import { db } from "~Services/Database";

import { NodeType } from "./Utilities/Node.Types";

export type EditorNode = Node<{
  id: string;
}>;

/*
 |--------------------------------------------------------------------------------
 | Helpers
 |--------------------------------------------------------------------------------
 */

export async function addEditorNode(type: NodeType, id: string): Promise<void> {
  db.collection("nodes").insertOne({
    type,
    position: await getPosition(type),
    dragHandle: ".node-drag-handle",
    data: { id }
  });
}

export async function getPosition(type: string): Promise<{ x: number; y: number }> {
  const nodes = await db.collection("nodes").find({ type });
  const maxY = nodes.length ? Math.max(...nodes.map((n) => n.position.y)) : 100;
  const maxNode = nodes.find((n) => n.position.y === maxY);
  return maxNode
    ? {
        x: maxNode?.position.x,
        y: maxNode?.position.y + (maxNode?.height || 0) + 20
      }
    : { x: 100, y: 100 };
}
