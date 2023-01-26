import { Disclosure } from "@headlessui/react";
import { Handle, Node, Position } from "reactflow";

import { BlockHeader } from "~components/block-header";
import { CodeEditor } from "~components/code-editor";

import { ReducerNodeController } from "./reducer.controller";

const ReducerView = ReducerNodeController.view(({ state: { node, model }, actions: { onChange } }) => {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} />
      <Disclosure defaultOpen={true}>
        {({ open }) => (
          <div className="bg-darker border rounded-sm text-xs border-darker-800 min-w-[390px] font-mono">
            <BlockHeader open={open} color="cyan" symbol="R" content="Reducer" />
            <Disclosure.Panel>
              <div
                className="border-b border-b-darker-800"
                style={{
                  width: 800,
                  height: 600
                }}
              >
                <CodeEditor defaultValue={node.data.config.code} model={model} onChange={onChange} />
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

export function ReducerNode({ id }: Node) {
  return <ReducerView id={id} />;
}
