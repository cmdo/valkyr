import { db } from "~services/database";
import { format } from "~services/prettier";

export function addReducerNode(): void {
  db.collection("nodes").insertOne({
    type: "reducer",
    position: { x: 0, y: 0 },
    dragHandle: ".node-drag-handle",
    data: {
      type: "reducer",
      config: {
        events: [],
        state: [],
        code: format(`
          async function reduce(state: State, event: EventRecord): Promise<State> {
            // write your reducer logic here ...
          };
        `)
      }
    }
  });
}

export type ReducerNodeData = {
  type: "reducer";
  config: {
    events: string[];
    state: [string, string][];
    code: string;
  };
  monaco: {
    model: string;
  };
};
