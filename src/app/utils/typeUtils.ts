/**
 * Type Definition Utilities
 * Central export point for commonly used types across the application
 */

// ===== Re-export from main types file =====
export type {
  Client,
  Site,
  Gift,
  Employee,
  Order,
  ApiError,
  Catalog,
  CatalogType,
  CatalogStatus,
  CatalogFilters,
  PriceLevel,
  SiteGiftConfiguration,
  CreateSiteFormData,
  CreateGiftFormData,
} from '../../types';

// ===== Re-export API types =====
export type {
  ApiResponse,
  PaginatedResponse,
  Client as ApiClient,
  Site as ApiSite,
} from '../types/api.types';

// ===== Re-export context types =====
export type { User } from '../context/AuthContext';
export type { Language } from '../context/LanguageContext';
export type { Client as SiteClient, Site as SiteContextSite } from '../context/SiteContext';

// ===== Re-export hook types =====
export type { SiteConfig, SiteSettings, UseSiteResult } from '../hooks/useSite';
export type { ApiState } from '../hooks/useApiUtils';
export type {
  FieldError,
  FormErrors,
  FormTouched,
  ValidationFunction,
  ValidationSchema,
} from '../hooks/useFormUtils';

// ===== Common utility types =====

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Make specific keys optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific keys required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract keys of a specific type
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Make properties nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Remove null from all properties
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Extract promise value type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Function type helper
 */
export type Func<Args extends unknown[] = unknown[], Return = unknown> = (...args: Args) => Return;

/**
 * Async function type helper
 */
export type AsyncFunc<Args extends unknown[] = unknown[], Return = unknown> = (
  ...args: Args
) => Promise<Return>;

/**
 * Event handler type
 */
export type EventHandler<E = Event> = (event: E) => void;

/**
 * Change handler type
 */
export type ChangeHandler<T = string> = (value: T) => void;

/**
 * React component props with children
 */
export type PropsWithChildren<P = {}> = P & {
  children?: React.ReactNode;
};

/**
 * React component props with className
 */
export type PropsWithClassName<P = {}> = P & {
  className?: string;
};

/**
 * React component props with style
 */
export type PropsWithStyle<P = {}> = P & {
  style?: React.CSSProperties;
};

/**
 * Generic object type
 */
export type GenericObject<T = unknown> = Record<string, T>;

/**
 * String literal union
 */
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;

/**
 * Tuple to union
 */
export type TupleToUnion<T extends readonly unknown[]> = T[number];

/**
 * Union to intersection
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/**
 * Mutable version of readonly type
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Value of object
 */
export type ValueOf<T> = T[keyof T];

/**
 * Branded type (nominal typing)
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Opaque type
 */
export type Opaque<T, K> = T & { readonly __opaque__: K };

/**
 * Exclusive OR type
 */
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

/**
 * Type-safe omit
 */
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Type-safe pick
 */
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

/**
 * At least one property required
 */
export type AtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/**
 * Exactly one property required
 */
export type ExactlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

/**
 * Merge two types
 */
export type Merge<T, U> = Omit<T, keyof U> & U;

/**
 * Override properties
 */
export type Override<T, U> = Omit<T, keyof U> & U;

/**
 * Primitive types
 */
export type Primitive = string | number | boolean | null | undefined | symbol | bigint;

/**
 * Builtin types
 */
export type Builtin = Primitive | ((...args: unknown[]) => unknown) | Date | Error | RegExp;

/**
 * Deep readonly
 */
export type DeepReadonly<T> = T extends Builtin
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<K, DeepReadonly<V>>
  : T extends Set<infer U>
  ? ReadonlySet<DeepReadonly<U>>
  : T extends Promise<infer U>
  ? Promise<DeepReadonly<U>>
  : T extends {}
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : Readonly<T>;

/**
 * Writable (opposite of readonly)
 */
export type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Deep writable
 */
export type DeepWritable<T> = T extends Builtin
  ? T
  : T extends Map<infer K, infer V>
  ? Map<K, DeepWritable<V>>
  : T extends Set<infer U>
  ? Set<DeepWritable<U>>
  : T extends Promise<infer U>
  ? Promise<DeepWritable<U>>
  : T extends {}
  ? { -readonly [K in keyof T]: DeepWritable<T[K]> }
  : T;

/**
 * Class constructor type
 */
export type Constructor<T = unknown> = new (...args: unknown[]) => T;

/**
 * Abstract class constructor type
 */
export type AbstractConstructor<T = unknown> = abstract new (...args: unknown[]) => T;

/**
 * Instance type from constructor
 */
export type InstanceTypeOf<T extends Constructor> = T extends Constructor<infer U> ? U : never;

/**
 * JSON-serializable types
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * JSON object
 */
export type JSONObject = { [key: string]: JSONValue };

/**
 * JSON array
 */
export type JSONArray = JSONValue[];

/**
 * Flatten nested type
 */
export type Flatten<T> = T extends any[] ? T[number] : T;

/**
 * Get required keys
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * Get optional keys
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * Split string literal type
 */
export type Split<S extends string, D extends string> = S extends `${infer T}${D}${infer U}`
  ? [T, ...Split<U, D>]
  : [S];

/**
 * Join string literal type
 */
export type Join<T extends string[], D extends string> = T extends [
  infer F extends string,
  ...infer R extends string[]
]
  ? R extends []
    ? F
    : `${F}${D}${Join<R, D>}`
  : '';

/**
 * CamelCase string
 */
export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>;

/**
 * SnakeCase string
 */
export type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${SnakeCase<U>}`
  : S;

/**
 * Type guard function
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Type predicate
 */
export type TypePredicate<T> = (value: unknown) => value is T;

/**
 * Comparison function
 */
export type CompareFn<T> = (a: T, b: T) => number;

/**
 * Predicate function
 */
export type PredicateFn<T> = (value: T, index: number, array: T[]) => boolean;

/**
 * Map function
 */
export type MapFn<T, U> = (value: T, index: number, array: T[]) => U;

/**
 * Reduce function
 */
export type ReduceFn<T, U> = (accumulator: U, value: T, index: number, array: T[]) => U;

/**
 * Filter function
 */
export type FilterFn<T> = (value: T, index: number, array: T[]) => boolean;