import { Dialog, Transition } from "@headlessui/react";
import { CaretDoubleRight, Plus, X } from "phosphor-react";
import { Fragment } from "react";

import { Button } from "~components/button";
import { Panel } from "~components/panel";

import { TypeView } from "../library/nodes/type/type.component";
import { SettingsController } from "./settings.controller";

export const SettingsView = SettingsController.view(({ state: { types }, props: { isOpen, setClosed } }) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="text-light relative z-10" onClose={setClosed}>
        <div className="pointer-events-none fixed inset-y-0 right-0 flex pl-10 sm:pl-16">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="pointer-events-auto w-96">
              <div className="bg-darker flex h-full flex-col overflow-y-scroll shadow-xl">
                <div className="border-darker-700 bg-darker-800 border-b p-3">
                  <div className="flex items-center justify-between gap-6">
                    <Dialog.Title className="text-pink text-sm">SETTINGS</Dialog.Title>
                    <Button variant="primary" outline type="button" onClick={() => setClosed()}>
                      <CaretDoubleRight size={16} />
                    </Button>
                  </div>
                </div>
                <Panel title="Configuration">
                  <div className="mb-2">
                    <header className="text-darker-700 tracking-wide">App</header>
                    <div className="flex flex-col gap-2 font-mono">
                      <span>Name</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <header className="text-darker-700 tracking-wide">Administrator</header>
                    <div className="flex flex-col gap-2 font-mono">
                      <span>Username</span>
                      <span>Password</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <header className="text-darker-700 tracking-wide">Mongo Database</header>
                    <div className="flex flex-col gap-2 font-mono">
                      <span>Name</span>
                      <span>Connection</span>
                    </div>
                  </div>
                </Panel>
                <Panel title="Types" defaultOpen={true}>
                  {types.map((type) => (
                    <TypeView key={type.id} id={type.id} />
                  ))}
                  <div className="flex w-full flex-row justify-center">
                    <Button variant="primary" outline type="button" onClick={() => alert("add a type??")}>
                      <Plus size={12}></Plus>
                      new type
                    </Button>
                  </div>
                </Panel>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
});
