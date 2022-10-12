import { deepEqual } from "fast-equals";
import React, { createElement, memo, PropsWithChildren, useEffect, useMemo, useState } from "react";

import { Refs } from "./ControllerRefs";

export class ViewController<Controller extends ControllerClass> {
  static #options: Partial<ViewOptions<any>> = {
    memoize: defaultMemoizeHandler
  };

  constructor(readonly controller: Controller) {}

  static set loading(component: React.FC) {
    this.#options.loading = component;
  }

  static set error(component: React.FC) {
    this.#options.error = component;
  }

  static set memo(value: boolean | Memoize<any>) {
    if (typeof value === "function") {
      this.#options.memoize = value;
    } else if (value === false) {
      this.#options.memoize = false;
    } else {
      this.#options.memoize = defaultMemoizeHandler;
    }
  }

  /**
   * Register a function react component to be controller by the controller
   * registered on the instance.
   *
   * @param component - Functional react component.
   */
  view<Props extends {}>(component: ReactComponent<Props, Controller>, options?: Partial<ViewOptions<Props>>) {
    const memoize = this.#getMemoize(options?.memoize);

    const wrapper: React.FC<PropsWithChildren<Props>> = (props) => {
      const [controller, setController] = useState<InstanceType<Controller> | undefined>(undefined);
      const [actions, setActions] = useState<any | undefined>();
      const [state, setState] = useState();
      const [error, setError] = useState<Error | undefined>();

      const renderLoading = useMemo(() => this.#getLoadingComponent(this.controller.name, options), []);
      const renderError = useMemo(() => this.#getErrorComponent(this.controller.name, options), []);

      useEffect(() => {
        const controller = this.controller.make(setState);
        setController(controller);
        setActions(controller.toActions());
        return () => {
          controller.$destroy();
        };
      }, []);

      useEffect(() => {
        if (controller === undefined) {
          return;
        }
        let isMounted = true;
        controller.$resolve(props).catch((error: Error) => {
          if (isMounted === true) {
            setError(error);
          }
        });
        return () => {
          isMounted = false;
        };
      }, [controller, props]);

      if (state === undefined) {
        return renderLoading(props);
      }

      if (error !== undefined) {
        return renderError({ ...props, error });
      }

      return component({ props, state, actions, refs: controller!.refs });
    };

    component.displayName = options?.name ?? component.name;
    wrapper.displayName = options?.name ?? component.name;

    // ### Memoize
    // By default run component through react memoization using stringify
    // matching to determine changes to props.

    if (memoize !== false) {
      return memo(wrapper, memoize);
    }

    return wrapper;
  }

  #getLoadingComponent(name: string, options?: Partial<ViewOptions<any>>) {
    const component = options?.loading ?? ViewController.#options.loading;
    if (component === undefined) {
      return () => null;
    }
    return (props) => createElement(component, props);
  }

  #getErrorComponent(name: string, options?: Partial<ViewOptions<any>>) {
    const component = options?.error ?? ViewController.#options.loading;
    if (component === undefined) {
      return () => null;
    }
    return (props) => createElement(component, props);
  }

  #getMemoize(memoize?: ViewOptions<any>["memoize"]): false | Memoize<any> {
    if (typeof memoize === "function") {
      return memoize;
    }
    if (memoize !== false) {
      return ViewController.#options.memoize;
    }
    return false;
  }
}

/*
 |--------------------------------------------------------------------------------
 | Defaults
 |--------------------------------------------------------------------------------
 */

function defaultMemoizeHandler(prev: any, next: any): boolean {
  if (prev.children !== undefined && next.children !== undefined) {
    if (prev.children.type.type.displayName !== next.children.type.type.displayName) {
      return false;
    }
  }
  return deepEqual(prev, next);
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type ReactComponent<Props extends {}, Controller extends ControllerClass> = React.FC<{
  props: Props;
  state: InstanceType<Controller>["state"];
  actions: Omit<InstanceType<Controller>, ReservedPropertyMembers>;
  refs: Refs;
  component?: React.FC;
}>;

type ViewOptions<Props> = {
  name?: string;
  loading: React.FC<Props>;
  error: React.FC<Props & { error: Error }>;
  memoize: false | Memoize<Props>;
};

type ReservedPropertyMembers = "state" | "pushState" | "init" | "destroy" | "setNext" | "setState" | "toActions";

type Memoize<Props> = (prevProps: Readonly<Props>, nextProps: Readonly<Props>) => boolean;

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type ControllerClass = {
  new (state: any, pushState: Function): any;
  make(pushState: Function): any;
};
