/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { ReactiveController, ReactiveControllerHost } from "lit";
import { EffectId, Unsubscribe, EffectFn } from "./types.mjs";

export class SideEffects implements ReactiveController {
  private effectDeps: Record<EffectId, unknown[]> = {};
  private effectUnsubscribes: Record<EffectId, Unsubscribe | undefined> = {};

  public constructor(private host: ReactiveControllerHost & Element) {
    this.host.addController(this);
  }

  /**
   * Use an effect function.
   */
  public use(effect: EffectFn, deps: unknown[]) {
    const id = getId(effect);
    if (shouldRun(deps, this.effectDeps[id])) {
      this.unsubscribeOldEffect(id);
      this.run(id, effect);
    }
  }

  public hostConnected() {
    this.clear();
  }

  public hostDisconnected() {
    Object.values(this.effectUnsubscribes).forEach((u) => (u ? u() : null));
    this.clear();
  }

  private unsubscribeOldEffect(id: EffectId) {
    const prevUnsubscribe = this.effectUnsubscribes[id];
    if (prevUnsubscribe) {
      prevUnsubscribe();
      this.effectUnsubscribes[id] = undefined;
    }
  }

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
  return id;
}

function shouldRun(currDeps: unknown[], prevDeps: unknown[]): boolean {
  if (!prevDeps) return true;
  if (currDeps.length !== prevDeps.length)
    throw new Error("effect dependency length should not change");

  return currDeps.every((value, idx) => prevDeps[idx] === value);
}
