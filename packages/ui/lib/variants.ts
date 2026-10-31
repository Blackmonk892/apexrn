type SlotOverrides<Slots> = { [S in keyof Slots]?: Partial<Slots[S]> };

type VariantMap<Slots> = Record<string, Record<string, SlotOverrides<Slots>>>;

export interface VariantsConfig<Slots, V extends VariantMap<Slots>> {
  base: Slots;
  variants: V;
  defaultVariants: { [K in keyof V]: keyof V[K] };
}

export type VariantSelection<V> = { [K in keyof V]?: keyof V[K] | null };

/**
 * Style-object cva: per slot, merges `base` and then one entry from each variant
 * group in declaration order. A missing, null or unknown selection uses the default.
 */
export function variants<Slots extends Record<string, object>, V extends VariantMap<Slots>>(
  config: VariantsConfig<Slots, V>,
) {
  return (selection: VariantSelection<V> = {}): Slots => {
    const result = {} as Record<string, object>;
    for (const slot of Object.keys(config.base)) result[slot] = { ...config.base[slot] };

    for (const group of Object.keys(config.variants)) {
      const options = config.variants[group];
      const picked = selection[group] as string | null | undefined;
      const key = picked != null && Object.prototype.hasOwnProperty.call(options, picked) ? picked : String(config.defaultVariants[group]);
      const overrides = options[key] as Record<string, object | undefined>;
      for (const slot of Object.keys(overrides)) {
        result[slot] = { ...result[slot], ...overrides[slot] };
      }
    }
    return result as Slots;
  };
}

export type VariantProps<F extends (selection?: never) => unknown> = NonNullable<Parameters<F>[0]>;
