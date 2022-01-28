/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { HookId } from "./types.mjs";
import { getHookFunctionId } from "./utils.mjs";

export class SideEffects implements ReactiveController {
  private deps: Record<HookId, EffectDeps> = {};
  private unsubscribes: Record<HookId, Dispose | undefined> = {};

  public constructor(private host: ReactiveControllerHost & Element) {
    this.host.addController(this);
  }

  /**
   * Use an effect function.
   */
  public use(effect: EffectFn, deps?: EffectDeps) {
    const id = getHookFunctionId(effect);
    const prevDeps = this.deps[id];
    if (shouldRun(deps, prevDeps)) {
      this.unsubscribeOldEffect(id);
      this.run(id, effect);
      this.deps[id] = deps;
    }
  }

  public hostConnected() {
    this.clear();
  }

  public hostDisconnected() {
    Object.keys(this.unsubscribes).forEach(this.unsubscribeOldEffect);
    this.clear();
  }

  private unsubscribeOldEffect = (id: HookId) => {
    const prevUnsubscribe = this.unsubscribes[id];
    if (prevUnsubscribe) {
      prevUnsubscribe();
      this.unsubscribes[id] = undefined;
    }
  };

  private run(id: HookId, effect: EffectFn) {
    const unsubscribe = effect();
    if (unsubscribe) {
      this.unsubscribes[id] = unsubscribe;
    }
  }

  private clear() {
    this.deps = {};
    this.unsubscribes = {};
  }
}

export type Dispose = () => void;
export type EffectFn = () => Dispose | void;
export type EffectDeps = unknown[] | undefined;

function shouldRun(currDeps: EffectDeps, prevDeps: EffectDeps): boolean {
  if (currDeps == null && prevDeps == null) {
    return true;
  }
  if (!prevDeps) return true;
  if (currDeps?.length !== prevDeps.length)
    throw new Error("Effect dependency length should not change");

  return !currDeps.every((value, idx) => prevDeps[idx] === value);
}
