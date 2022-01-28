import { Keys } from "./types.mjs";

/**
 * Decorator for an effect function
 * @param effectId The identifier for the effect
 * @returns
 */
export function effect() {
  return function effectful(
    target: any,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    const effectId = key;
    let fn = descriptor.value.bind(target);
    fn[Keys.EffectId] = effectId;

    return {
      configurable: false,
      get: () => fn,
    };
  };
}
