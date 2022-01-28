import type { HookId } from "./types.mjs";

/**
 * Gets the hook function name
 * @param fn The hook function to inspect
 * @returns
 */
export function getHookFunctionId(fn: Function): HookId {
  const id = fn.name;
  if (!id) {
    throw new Error(
      "Could not get id for hook function. The function must have a name"
    );
  }

  return id;
}
