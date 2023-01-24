import { Controller } from "@valkyr/react";
import { addEdge, applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, Node, NodeChange, NodeTypes } from "reactflow";

import { db } from "~services/database";

import { EventNode } from "../nodes/event";
import { ReducerNode } from "../nodes/reducer";
import { NodeManager } from "../services/NodeManager";

export class EditorController extends Controller<{
  nodeTypes: NodeTypes;
  nodes: Node[];
  edges: Edge[];
}> {
  #nodeManager = new NodeManager();

  async onInit() {
    return {
      nodeTypes: {
        event: EventNode,
        reducer: ReducerNode
      },
      nodes: await this.query(db.collection("nodes"), {}, "nodes"),
      edges: await this.query(db.collection("edges"), {}, "edges")
    };
  }

  addNode(node: Omit<Node, "id">): void {
    db.collection("nodes").insertOne(node);
  }

  onNodesChange(changes: NodeChange[]): void {
    this.setState("nodes", applyNodeChanges(changes, this.state.nodes));
    this.#nodeManager.addNodeChanges(changes);
  }

  onEdgesChange(changes: EdgeChange[]): void {
    this.setState("edges", applyEdgeChanges(changes, this.state.edges));
  }

  onConnect(params: any): void {
    this.setState("edges", addEdge(params, this.state.edges));
  }
}
