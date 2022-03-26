import { useRef } from "react";

import { JSON } from "../../../Types";
import type { Inputs, Options, Props } from "../Types";

type Actions<Data extends JSON> = {
  register(name: string): Props;
  data(): Data;
  clear(): void;
};

export function useForm<Data extends JSON>({ focus, defaultValues = {} }: Options<Data> = {}): Actions<Data> {
  const inputs = useRef<Inputs>({});
  return {
    register(name: string) {
      return {
        ref: (input: HTMLInputElement | HTMLTextAreaElement) => {
          if (!input) {
            return;
          }
          if (focus && focus === name) {
            input.focus();
          }
          if (defaultValues[name] !== undefined) {
            input.value = defaultValues[name];
          }
          inputs.current[name] = input;
        },
        onChange({ target: { value } }) {
          inputs.current[name].value = value;
        }
      };
    },
    data(): Data {
      const data: JSON = {};
      for (const key in inputs.current) {
        data[key] = inputs.current[key].value;
      }
      return data as Data;
    },
    clear(): void {
      for (const key in inputs.current) {
        inputs.current[key].value = "";
      }
    }
  };
}
