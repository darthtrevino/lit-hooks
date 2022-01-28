export type Unsubscribe = () => void;
export type EffectId = string | symbol;
export type EffectFn = () => Unsubscribe | undefined;
export interface EffectOptions {
  id?: EffectId;
}

export const Keys = {
  EffectId: Symbol("EffectId"),
};
