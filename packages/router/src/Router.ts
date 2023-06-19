import type { BrowserHistory, HashHistory, Location, MemoryHistory } from "history";
import { match, Path } from "path-to-regexp";
import { Subject, Subscription } from "rxjs";

import { Redirect, RenderProps, response } from "./Action.js";
import {
  ActionRedirected,
  ActionRejectedException,
  RenderActionMissingException,
  RouteNotFoundException
} from "./Exceptions.js";
import { isHashChange } from "./Location.js";
import { Resolved } from "./Resolved.js";
import { Route } from "./Route.js";

export class Router<Component = unknown> {
  #base: string;

  #history: BrowserHistory | HashHistory | MemoryHistory;
  #routes: Route[] = [];

  #subscribers = {
    location: new Subject<Location>(),
    resolved: new Subject<Resolved>()
  };

  #parent?: Route;
  #resolved?: Resolved;

  #render?: (component: Component, props?: RenderProps) => void;
  #error?: (error: ActionRejectedException | RenderActionMissingException | RouteNotFoundException) => void;
  #destroy?: () => void;

  constructor(history: BrowserHistory | HashHistory | MemoryHistory, base = "") {
    this.#base = base === "" || base === "/" ? "" : base;
    this.#history = history;
  }

  /*
   |--------------------------------------------------------------------------------
   | Accessors
   |--------------------------------------------------------------------------------
   */

  get routes(): Route[] {
    return Array.from(this.#routes);
  }

  get location(): Location {
    return this.#history.location;
  }

  get state(): Location["state"] {
    return this.#history.location["state"];
  }

  get params(): Resolved["params"] {
    return this.resolved.params;
  }

  get query(): Resolved["query"] {
    return this.resolved.query;
  }

  get route(): Resolved["route"] {
    return this.resolved.route;
  }

  get resolved(): Resolved {
    if (this.#resolved === undefined) {
      throw new Error("No route has been resolved yet");
    }
    return this.#resolved;
  }

  /*
   |--------------------------------------------------------------------------------
   | Setup
   |--------------------------------------------------------------------------------
   */

  register(routes: Route[], parent?: Route): this {
    for (const route of routes) {
      route.parent = parent;
      if (route.children !== undefined) {
        this.#routes.push(route.register(this.#base));
        this.register(route.children, route);
      } else {
        this.#routes.push(route.register(this.#base));
      }
    }
    return this;
  }

  /*
   |--------------------------------------------------------------------------------
   | Listeners
   |--------------------------------------------------------------------------------
   */

  /**
   * Register render handler receiving the component and props to render.
   *
   * @param handler - Handler method for incoming components and props.
   */
  onRouteRender(handler: (component: Component, props?: RenderProps) => void): this {
    this.#render = handler;
    return this;
  }

  /**
   * Register error handler receiving the error to render.
   *
   * @param handler - Handler method for incoming errors.
   */
  onRouteError(
    handler: (error: ActionRejectedException | RenderActionMissingException | RouteNotFoundException) => void
  ): this {
    this.#error = handler;
    return this;
  }

  /**
   * Starts listening for routing changes which emits results to the provided
   * render or error method.
   *
   * @param render - Render method to execute on render actions.
   * @param error  - Error method to execute on routing exceptions.
   */
  listen(): this {
    if (this.#destroy !== undefined) {
      this.#destroy();
    }

    let prevLocation = this.location;
    this.#destroy = this.#history.listen(async ({ location }) => {
      if (isHashChange(prevLocation, location) === true) {
        prevLocation = location;
        return this.#subscribers.location.next(location);
      }
      prevLocation = location;
      this.#resolve(location.pathname, location.search);
    });

    this.#resolve(this.location.pathname, this.location.search);

    return this;
  }

  /*
   |--------------------------------------------------------------------------------
   | Routing Utilities
   |--------------------------------------------------------------------------------
   */

  async #resolve(path: string, search?: string) {
    const resolved = this.getResolvedRoute(path, search);
    if (resolved === undefined) {
      return this.#error?.(new RouteNotFoundException(path));
    }
    this.setRoute(resolved);
    try {
      const tree = this.#getRoutingTree(resolved.route);
      for (const [index, route] of tree.entries()) {
        await this.#execute(route, resolved, index);
      }
    } catch (err) {
      if (err instanceof ActionRedirected) {
        this.redirect(err.redirect);
      } else {
        this.#error?.(err);
      }
    }
  }

  async #execute(route: Route, resolved: Resolved, index: number): Promise<void> {
    for (const action of route.actions) {
      const res = await action.call(response, resolved);
      switch (res.status) {
        case "redirect": {
          throw new ActionRedirected(res);
        }
        case "reject": {
          throw new ActionRejectedException(res.message, res.details);
        }
        case "render": {
          if (index === 0 && this.#parent !== route) {
            this.#parent = route;
            return this.#render?.(res.component, res.props);
          }
          this.#subscribers.resolved.next(resolved);
        }
      }
    }
  }

  #getRoutingTree(route: Route, tree: Route[] = []): Route[] {
    if (route.parent !== undefined) {
      tree.push(route);
      return this.#getRoutingTree(route.parent, tree);
    }
    tree.push(route);
    return tree.reverse();
  }

  /*
   |--------------------------------------------------------------------------------
   | Subscribers
   |--------------------------------------------------------------------------------
   */

  /**
   * Subscribe to route changes.
   *
   * @param next - Handler to execute on incoming route.
   *
   * @returns RXJS Subscription.
   */
  subscribe(next: RoutedHandler): Subscription {
    return this.#subscribers.resolved.subscribe(next);
  }

  subscribeToLocation(next: (location: Location) => void): Subscription {
    return this.#subscribers.location.subscribe((location) => {
      next(location);
    });
  }

  /**
   * Subscribe to a list of paths and execute the next handler when the incoming
   * route matches any of the paths.
   *
   * @param paths - List of paths to subscribe to.
   * @param next  - Handler to execute on incoming route.
   *
   * @returns RXJS Subscription.
   */
  subscribeToPaths(paths: string[], next: RoutedHandler): Subscription {
    return this.#subscribers.resolved.subscribe((matched) => {
      for (const path of paths) {
        if (matched.route.match(path)) {
          next(matched);
        }
      }
    });
  }

  /*
   |--------------------------------------------------------------------------------
   | Actions
   |--------------------------------------------------------------------------------
   */

  /**
   * Redirect response.
   *
   * @remarks
   * When redirecting internally the origin is passed to the new route in case
   * we want to reference it.
   *
   * @param response - Redirect response.
   * @param origin   - Origin to assign with the redirect.
   * @param onGoTo   - Callback to execute on internal routing.
   */
  redirect(response: Redirect): void {
    if (response.isExternal) {
      window.location.replace(response.path);
    } else {
      this.goto(response.path, { origin: this.location });
    }
  }

  /**
   * Push a new routing request into the history instance triggering a new routing
   * transition.
   *
   * @param path  - Path to resolve.
   * @param state - State to pass.
   */
  goto(path: string, state: Record<string, unknown> = {}): this {
    const parts = (this.#base + path.replace(this.#base, "")).replace(/\/$/, "").split("?");
    this.#history.push(
      {
        pathname: parts[0] || "/",
        search: parts[1] ? `${parts[1]}` : ""
      },
      state
    );
    return this;
  }

  forward = () => {
    this.#history.forward();
  };

  back = () => {
    this.#history.back();
  };

  /**
   * Reload the current route by re-executing the request.
   *
   * @returns Router
   */
  reload(): this {
    this.#history.replace(
      {
        pathname: this.location.pathname,
        search: this.location.search
      },
      this.location.state
    );
    return this;
  }

  /*
   |--------------------------------------------------------------------------------
   | Utilities
   |--------------------------------------------------------------------------------
   */

  /**
   * Check if the provided path matches the current route location.
   *
   * @param path - RegEx path to match against location.
   */
  match(path: Path): boolean {
    return match(path)(this.location.pathname) !== false;
  }

  /**
   * Attach the provided request to the current route assignment.
   *
   * @remarks This provides shortcut access to the currently resolved routes state,
   * query and parameter values.
   *
   * @param resolved - Resolved route.
   */
  setRoute(resolved: Resolved): this {
    this.#resolved = resolved;
    return this;
  }

  /**
   * Get the resolved route for the provided path or return undefined if provided
   * path does not match any registered routes.
   *
   * @param path   - Path to retrieve a route for.
   * @param search - Search string starting with `?`.
   */
  getResolvedRoute(path: string, search = this.location.search): Resolved | undefined {
    const resolved = this.getRoute(path);
    if (resolved === undefined) {
      return undefined;
    }
    return new Resolved(resolved.route, resolved.params, search, this.#history);
  }

  /**
   * Get a route from the registered list of routes.
   *
   * @param path - Path to match against.
   */
  getRoute(path: string): { route: Route; params: Object } | undefined {
    for (const route of this.#routes) {
      const params = route.match(path);
      if (params !== false) {
        return { route, params };
      }
    }
    return undefined;
  }

  /**
   * Get a route by its assigned id.
   *
   * @param id - Route id to retrieve.
   */
  getRouteById(id: string): Route | undefined {
    return this.#routes.find((route) => route.id === id);
  }

  /**
   * Return a render result that should render for the provided resolved route
   * or return undefined if the route does not result in a render output.
   *
   * @param resolved - Resolved route.
   * @param props    - Additional props to assign to the render result.
   */
  async getRender<R extends Router<Component>>(
    resolved: Resolved,
    props: any = {}
  ): Promise<RoutedResult<R> | undefined> {
    for (const action of resolved.route.actions) {
      const res = await action.call(response, resolved);
      switch (res.status) {
        case "render": {
          const params = resolved.params.get() ?? {};
          const query = resolved.query.get() ?? {};
          return {
            id: resolved.route.id,
            name: resolved.route.name,
            location: this.location,
            component: res.component,
            props: {
              ...res.props,
              ...params,
              ...query,
              ...props
            }
          };
        }
      }
    }
    return undefined;
  }
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type RoutedHandler = (result: Resolved) => void;

export type RoutedResult<Router> = {
  id?: string;
  name?: string;
  location: Location;
  component: RouterComponent<Router>;
  props: RenderProps;
};

export type RouterComponent<Type> = Type extends Router<infer X> ? X : never;
