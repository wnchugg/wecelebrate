/**
 * Global Type Declarations
 * Augment global types and declare ambient modules
 */

// ===== Augment Window Interface =====

declare global {
  interface Window {
    // Environment
    ENV?: string;
    
    // Debugging
    __DEBUG__?: boolean;
    __DEVELOPMENT__?: boolean;
    
    // Feature flags
    __FEATURES__?: Record<string, boolean>;
    
    // Analytics
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    
    // Stripe
    Stripe?: any;
    
    // Custom events
    addEventListener(type: 'app:error', listener: (event: CustomEvent<Error>) => void): void;
    addEventListener(type: 'app:warning', listener: (event: CustomEvent<string>) => void): void;
    removeEventListener(type: 'app:error', listener: (event: CustomEvent<Error>) => void): void;
    removeEventListener(type: 'app:warning', listener: (event: CustomEvent<string>) => void): void;
  }
}

// ===== Module Augmentations =====

// Augment React to support custom props
declare module 'react' {
  interface HTMLAttributes<T> {
    // Allow data attributes
    [key: `data-${string}`]: any;
    
    // Allow aria attributes
    [key: `aria-${string}`]: any;
  }
  
  interface CSSProperties {
    // CSS variables
    [key: `--${string}`]: string | number;
  }
}

// Augment React Router
declare module 'react-router' {
  export interface LoaderFunctionArgs {
    params: Record<string, string | undefined>;
    request: Request;
  }
}

// ===== Utility Types =====

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = T extends object ? {
  [P in keyof T]-?: DeepRequired<T[P]>;
} : T;

/**
 * Make all properties readonly recursively
 */
export type DeepReadonly<T> = T extends object ? {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
} : T;

/**
 * Make all properties mutable recursively
 */
export type DeepMutable<T> = T extends object ? {
  -readonly [P in keyof T]: DeepMutable<T[P]>;
} : T;

/**
 * Make some keys optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make some keys required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Make nullable
 */
export type Nullable<T> = T | null;

/**
 * Make optional
 */
export type Optional<T> = T | undefined;

/**
 * Make nullable or undefined
 */
export type Maybe<T> = T | null | undefined;

/**
 * Extract keys with specific value type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Extract properties with specific value type
 */
export type PropertiesOfType<T, U> = Pick<T, KeysOfType<T, U>>;

/**
 * Exclude keys with specific value type
 */
export type ExcludeKeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? never : K;
}[keyof T];

/**
 * Omit properties with specific value type
 */
export type OmitPropertiesOfType<T, U> = Pick<T, ExcludeKeysOfType<T, U>>;

/**
 * Function type
 */
export type Fn<Args extends any[] = any[], Return = any> = (...args: Args) => Return;

/**
 * Async function type
 */
export type AsyncFn<Args extends any[] = any[], Return = any> = (...args: Args) => Promise<Return>;

/**
 * Constructor type
 */
export type Constructor<T = any, Args extends any[] = any[]> = new (...args: Args) => T;

/**
 * Abstract constructor type
 */
export type AbstractConstructor<T = any> = abstract new (...args: any[]) => T;

/**
 * Class type
 */
export type Class<T = any> = Constructor<T> | AbstractConstructor<T>;

/**
 * Primitive types
 */
export type Primitive = string | number | boolean | null | undefined | symbol | bigint;

/**
 * Non-nullable type
 */
export type NonNullable<T> = Exclude<T, null | undefined>;

/**
 * ValueOf type
 */
export type ValueOf<T> = T[keyof T];

/**
 * Entries type
 */
export type Entries<T> = Array<[keyof T, ValueOf<T>]>;

/**
 * Awaited type (for Promise unwrapping)
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * UnwrapPromise type
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

/**
 * Mutable type (remove readonly)
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Writable type (remove readonly recursively)
 */
export type Writable<T> = T extends object ? {
  -readonly [P in keyof T]: Writable<T[P]>;
} : T;

/**
 * Modify type
 */
export type Modify<T, R> = Omit<T, keyof R> & R;

/**
 * Merge types
 */
export type Merge<A, B> = Omit<A, keyof B> & B;

/**
 * Deep merge types
 */
export type DeepMerge<A, B> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? B[K] extends object
      ? K extends keyof A
        ? A[K] extends object
          ? DeepMerge<A[K], B[K]>
          : B[K]
        : B[K]
      : B[K]
    : K extends keyof A
    ? A[K]
    : never;
};

/**
 * Exact type (no extra properties)
 */
export type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

/**
 * Pretty type (expand type for better display)
 */
export type Pretty<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Flatten type (merge intersection types)
 */
export type Flatten<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/**
 * UnionToIntersection type
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

/**
 * PickByValue type
 */
export type PickByValue<T, V> = Pick<T, {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T]>;

/**
 * OmitByValue type
 */
export type OmitByValue<T, V> = Pick<T, {
  [K in keyof T]: T[K] extends V ? never : K;
}[keyof T]>;

/**
 * RequireAtLeastOne type
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/**
 * RequireOnlyOne type
 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & {
    [K in Keys]: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>>;
  }[Keys];

/**
 * ArrayElement type
 */
export type ArrayElement<T> = T extends (infer E)[] ? E : T extends readonly (infer E)[] ? E : never;

/**
 * TupleToUnion type
 */
export type TupleToUnion<T extends readonly any[]> = T[number];

/**
 * IsAny type
 */
export type IsAny<T> = 0 extends (1 & T) ? true : false;

/**
 * IsNever type
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * IsUnknown type
 */
export type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;

/**
 * Brand type (nominal typing)
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * JSON types
 */
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

/**
 * Tail type (remove first element from tuple)
 */
export type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;

/**
 * Head type (get first element from tuple)
 */
export type Head<T extends any[]> = T extends [infer First, ...any[]] ? First : never;

/**
 * Last type (get last element from tuple)
 */
export type Last<T extends any[]> = T extends [...any[], infer Last] ? Last : never;

/**
 * StringStartsWith type
 */
export type StringStartsWith<S extends string, Prefix extends string> =
  S extends `${Prefix}${infer _}` ? true : false;

/**
 * StringEndsWith type
 */
export type StringEndsWith<S extends string, Suffix extends string> =
  S extends `${infer _}${Suffix}` ? true : false;

/**
 * Split string type
 */
export type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    ? [Head, ...Split<Tail, D>]
    : S extends ''
    ? []
    : [S];

/**
 * Join string type
 */
export type Join<T extends string[], D extends string = ''> =
  T extends [infer F extends string, ...infer R extends string[]]
    ? R extends []
      ? F
      : `${F}${D}${Join<R, D>}`
    : '';

export {};
