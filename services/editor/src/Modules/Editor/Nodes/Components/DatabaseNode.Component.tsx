import { Handle, NodeProps, Position } from "reactflow";

import { DatabaseBlock } from "~Blocks/Database/Database.Component";

export function DatabaseNode({ data: { id } }: NodeProps) {
  return (
    <div className="relative">
      <DatabaseBlock id={id} />
      <div className="absolute top-1/2 -right-2 flex h-9 -translate-y-1/2 flex-col justify-center gap-1">
        <Handle type="source" className="h-3 w-2 bg-green-600" position={Position.Right} />
      </div>
    </div>
  );
}
