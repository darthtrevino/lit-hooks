/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { ReactiveController, ReactiveControllerHost } from "lit";

export class SideEffects implements ReactiveController {
  private effectDeps: Record<EffectId, unknown[]> = {};
  private effectUnsubscribes: Record<EffectId, Unsubscribe | undefined> = {};

  public constructor(private host: ReactiveControllerHost & Element) {
    this.host.addController(this);
  }

  public use(id: EffectId, effect: EffectFn, deps: unknown[]) {
    if (this.shouldEffectRun(deps, this.effectDeps[id])) {
      // invoke old cleanups
      const prevUnsubscribe = this.effectUnsubscribes[id];
      if (prevUnsubscribe) {
        prevUnsubscribe();
        this.effectUnsubscribes[id] = undefined;
      }

      // run the effect
      const unsubscribe = effect();
      if (unsubscribe) {
        this.effectUnsubscribes[id] = unsubscribe;
      }
    }
  }

  public hostConnected() {
    this.clear();
  }

  public hostDisconnected() {
    Object.values(this.effectUnsubscribes).forEach((u) => u ? u() : null);
    this.clear();
  }

  private clear() {
    this.effectDeps = {};
    this.effectUnsubscribes = {};
  }

  private shouldEffectRun(currDeps: unknown[], prevDeps: unknown[]): boolean {
    if (!prevDeps) return true;
    if (currDeps.length !== prevDeps.length)
      throw new Error("effect dependency length should not change");

    return currDeps.every((value, idx) => prevDeps[idx] === value);
  }
}
