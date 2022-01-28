
/**
 * Decorator for an effect function
 * @param effectId The identifier for the effect
 * @returns
 */
 export function effect({ id }: EffectOptions) {
  return function effectful(target: Function) {
    (target as any).__EFFECT_ID__ = id;
    return target;
  };
}