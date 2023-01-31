import { Handle, NodeProps, Position } from "reactflow";

import { StateBlock } from "../../Library/Blocks/State/State.Component";

export function StateNode({ data: { id } }: NodeProps) {
  return (
    <div className="relative">
      <StateBlock id={id} />
      <Handle
        type="source"
        className="state-output-handle bg-pink-600/75 hover:bg-pink-600"
        position={Position.Right}
      />
    </div>
  );
}
