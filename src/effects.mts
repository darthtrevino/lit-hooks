/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { ReactiveController, ReactiveControllerHost } from "lit";

export class SideEffects implements ReactiveController {
  private effectDeps: Record<EffectId, EffectDeps> = {};
  private effectUnsubscribes: Record<EffectId, Dispose | undefined> = {};

  public constructor(private host: ReactiveControllerHost & Element) {
    this.host.addController(this);
  }

  /**
   * Use an effect function.
   */
  public use(effect: EffectFn, deps?: EffectDeps) {
    const id = getId(effect);
    const prevDeps = this.effectDeps[id];
    if (shouldRun(deps, prevDeps)) {
      this.unsubscribeOldEffect(id);
      this.run(id, effect);
      this.effectDeps[id] = deps;
    }
  }

  public hostConnected() {
    this.clear();
  }

  public hostDisconnected() {
    Object.keys(this.effectUnsubscribes).forEach(this.unsubscribeOldEffect);
    this.clear();
  }

  private unsubscribeOldEffect = (id: EffectId) => {
    const prevUnsubscribe = this.effectUnsubscribes[id];
    if (prevUnsubscribe) {
      prevUnsubscribe();
      this.effectUnsubscribes[id] = undefined;
    }
  };

  private run(id: EffectId, effect: EffectFn) {
    const unsubscribe = effect();
    if (unsubscribe) {
      this.effectUnsubscribes[id] = unsubscribe;
    }
  }

  private clear() {
    this.effectDeps = {};
    this.effectUnsubscribes = {};
  }
}

function getId(effect: EffectFn): string {
  const id = effect.name;
  if (!id) {
    throw new Error(
      "Could not get Id for effect. The function must have a name"
    );
  }
  6;
  return id;
}

function shouldRun(currDeps: EffectDeps, prevDeps: EffectDeps): boolean {
  if (currDeps == null && prevDeps == null) {
    return true;
  }
  if (!prevDeps) return true;
  if (currDeps?.length !== prevDeps.length)
    throw new Error("Effect dependency length should not change");

  return !currDeps.every((value, idx) => prevDeps[idx] === value);
}

export type EffectDeps = unknown[] | undefined;
export type Dispose = () => void;
export type EffectId = string | symbol;
export type EffectFn = () => Dispose | void;
