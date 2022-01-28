type Unsubscribe = () => void;
type EffectId = string | symbol;
type EffectFn = () => Unsubscribe | undefined;
interface EffectOptions {
  id: EffectId;
}
