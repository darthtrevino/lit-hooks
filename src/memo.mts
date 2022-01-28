/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { HookId } from "./types.mjs";
import { getHookFunctionId } from "./utils.mjs";

export interface MemoizationOptions {
  /**
   * Whether to clear memoization results when connected.
   *
   * @default true
   */
  clearOnConnect?: boolean;

  /**
   * Whether to clear memoization results when disconnected.
   *
   * @default true
   */
  clearOnDisconnect?: boolean;
}

export class Memoization implements ReactiveController {
  private deps: Record<HookId, MemoDeps> = {};
  private results: Record<HookId, unknown> = {};

  private get clearOnConnect(): boolean {
    return this.options.clearOnConnect ?? true;
  }

  private get clearOnDisconnect(): boolean {
    return this.options.clearOnDisconnect ?? true;
  }

  public constructor(
    private host: ReactiveControllerHost & Element,
    private options: MemoizationOptions = {}
  ) {
    this.host.addController(this);
  }

  /**
   * Use a memoization.
   */
  public use<T>(memoFn: MemoFn<T>, deps: MemoDeps): T {
    const id = getHookFunctionId(memoFn);
    const prevDeps = this.deps[id];
    if (shouldRun(deps, prevDeps)) {
      const result = memoFn() as T;
      this.deps[id] = deps;
      this.results[id] = result;
    }
    return this.results[id] as T;
  }

  public hostConnected() {
    if (this.clearOnConnect) {
      this.clear();
    }
  }

  public hostDisconnected() {
    if (this.clearOnDisconnect) {
      this.clear();
    }
  }

  private clear() {
    this.deps = {};
    this.results = {};
  }
}

export type MemoFn<T> = () => T;
export type MemoDeps = unknown[];

/**
 * Checks hook dependencies to see if it should run (memoization, effects)
 */
function shouldRun(currDeps: MemoDeps, prevDeps: MemoDeps): boolean {
  if (currDeps == null) {
    throw new Error('memoization deps must be defined')
  }
  if (!prevDeps) return true;
  if (currDeps.length !== prevDeps.length)
    throw new Error("Effect dependency length should not change");

  return !currDeps.every((value, idx) => prevDeps[idx] === value);
}
