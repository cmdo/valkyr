import { Controller } from "@valkyr/react";
import { applyNodeChanges, Connection, Edge, Node, ReactFlowInstance } from "reactflow";

import { db } from "~services/database";

import { EventNode } from "../nodes/event/event.component";
import { ReducerNode } from "../nodes/reducer/reducer.component";
import { StateNode } from "../nodes/state/state.component";
import { TypeNode } from "../nodes/type/type.component";

export const nodeTypes = {
  event: EventNode,
  reducer: ReducerNode,
  state: StateNode,
  type: TypeNode
};

export class EditorController extends Controller<{
  nodes: Node[];
  edges: Edge[];
  asideOpen: boolean;
}> {
  #instance?: ReactFlowInstance;

  async onInit() {
    return {
      nodes: await this.query(db.collection("nodes"), {}, async (documents, changed, type) => {
        switch (type) {
          case "insertOne":
          case "insertMany": {
            this.#instance?.addNodes(changed);
            break;
          }
          case "updateOne":
          case "updateMany": {
            this.#instance?.setNodes(documents);
            break;
          }
          case "remove": {
            this.#instance?.deleteElements({ nodes: changed });
            break;
          }
        }
        return {
          nodes: documents
        };
      }),
      edges: await db.collection("edges").find(),
      asideOpen: false
    };
  }

  setInstance(instance: ReactFlowInstance) {
    this.#instance = instance;
  }

  toggleAside(state: boolean) {
    this.setState("asideOpen", state);
  }

  onNodePositionChanged(_: any, node: Node): void {
    db.collection("nodes")
      .findOne({ id: node.id })
      .then((current) => {
        if (nodePositionChanged(current, node) === true) {
          db.collection("nodes").updateOne(
            { id: node.id },
            {
              $set: {
                position: node.position,
                positionAbsolute: node.positionAbsolute
              }
            }
          );
        }
      });
  }

  onConnect(connection: Connection): void {
    const { source, target } = connection;
    if (source !== null && target !== null) {
      db.collection("edges").insertOne({
        id: `reactflow__edge-${source}-${target}`,
        source,
        target
      });
    }
  }
}

function nodePositionChanged(current: Node | undefined, node: Node): boolean {
  if (current === undefined) {
    return true;
  }
  if (current.position.x !== node.position.x) {
    return true;
  }
  if (current.position.y !== node.position.y) {
    return true;
  }
  return false;
}
