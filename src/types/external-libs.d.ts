/**
 * Type definitions for external libraries without proper types
 * This file provides type declarations for libraries that don't have @types packages
 */

// ==================== React Slick ====================
declare module 'react-slick' {
  import { Component } from 'react';

  export interface Settings {
    dots?: boolean;
    infinite?: boolean;
    speed?: number;
    slidesToShow?: number;
    slidesToScroll?: number;
    autoplay?: boolean;
    autoplaySpeed?: number;
    arrows?: boolean;
    fade?: boolean;
    vertical?: boolean;
    adaptiveHeight?: boolean;
    centerMode?: boolean;
    centerPadding?: string;
    cssEase?: string;
    focusOnSelect?: boolean;
    lazyLoad?: 'ondemand' | 'progressive';
    pauseOnHover?: boolean;
    swipeToSlide?: boolean;
    variableWidth?: boolean;
    responsive?: Array<{
      breakpoint: number;
      settings: Partial<Settings>;
    }>;
    beforeChange?: (currentSlide: number, nextSlide: number) => void;
    afterChange?: (currentSlide: number) => void;
    [key: string]: any;
  }

  export default class Slider extends Component<Settings> {
    slickNext(): void;
    slickPrev(): void;
    slickGoTo(slide: number, dontAnimate?: boolean): void;
    slickPause(): void;
    slickPlay(): void;
  }
}

// ==================== React Responsive Masonry ====================
declare module 'react-responsive-masonry' {
  import { ReactNode } from 'react';

  export interface MasonryProps {
    columnsCount?: number;
    gutter?: string;
    children?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }

  export interface ResponsiveMasonryProps {
    columnsCountBreakPoints?: { [key: number]: number };
    children?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }

  export const Masonry: React.FC<MasonryProps>;
  export const ResponsiveMasonry: React.FC<ResponsiveMasonryProps>;
}

// ==================== React DnD ====================
declare module 'react-dnd' {
  import { ReactNode } from 'react';

  export interface DndContextProps {
    children?: ReactNode;
  }

  export interface useDragOptions {
    type: string;
    item: any;
    collect?: (monitor: any) => any;
    end?: (item: any, monitor: any) => void;
  }

  export interface useDropOptions {
    accept: string | string[];
    drop?: (item: any, monitor: any) => void;
    hover?: (item: any, monitor: any) => void;
    collect?: (monitor: any) => any;
  }

  export function DndProvider(props: { backend: any; children?: ReactNode }): JSX.Element;
  export function useDrag(options: useDragOptions): [any, any];
  export function useDrop(options: useDropOptions): [any, any];
}

declare module 'react-dnd-html5-backend' {
  const HTML5Backend: any;
  export { HTML5Backend };
}

// ==================== Date-fns ====================
declare module 'date-fns' {
  export function format(date: Date | number | string, formatStr: string, options?: any): string;
  export function formatDistance(
    date: Date | number | string,
    baseDate: Date | number | string,
    options?: any
  ): string;
  export function formatDistanceToNow(date: Date | number | string, options?: any): string;
  export function parseISO(dateString: string): Date;
  export function isValid(date: any): boolean;
  export function addDays(date: Date | number, amount: number): Date;
  export function subDays(date: Date | number, amount: number): Date;
  export function startOfDay(date: Date | number): Date;
  export function endOfDay(date: Date | number): Date;
  export function isBefore(date: Date | number, dateToCompare: Date | number): boolean;
  export function isAfter(date: Date | number, dateToCompare: Date | number): boolean;
  export function differenceInDays(
    dateLeft: Date | number,
    dateRight: Date | number
  ): number;
}

// ==================== ExcelJS ====================
declare module 'exceljs' {
  export class Workbook {
    creator: string;
    lastModifiedBy: string;
    created: Date;
    modified: Date;
    addWorksheet(name: string, options?: any): Worksheet;
    getWorksheet(name: string | number): Worksheet;
    removeWorksheet(id: number): void;
    xlsx: {
      writeBuffer(): Promise<Buffer>;
      load(buffer: ArrayBuffer): Promise<void>;
    };
  }

  export class Worksheet {
    name: string;
    columns: Array<{ header: string; key: string; width?: number }>;
    addRow(data: any): Row;
    getRow(index: number): Row;
    getColumn(key: string | number): Column;
    getSheetValues(): any[];
    eachRow(callback: (row: Row, rowNumber: number) => void): void;
  }

  export class Row {
    values: any[];
    getCell(index: number | string): Cell;
    commit(): void;
  }

  export class Cell {
    value: any;
    style: any;
  }

  export class Column {
    key: string;
    width: number;
    eachCell(callback: (cell: Cell, rowNumber: number) => void): void;
  }
}

// ==================== Zod ====================
declare module 'zod' {
  // Base type for all Zod schemas
  export interface ZodType<T = any> {
    parse(data: unknown): T;
    safeParse(data: unknown): { success: true; data: T } | { success: false; error: ZodError<T> };
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
    _output: T;
    _input: T;
  }

  // Zod error type
  export interface ZodIssue {
    path: (string | number)[];
    message: string;
    code: string;
  }

  export interface ZodError<T = any> {
    issues: ZodIssue[];
    message: string;
  }

  export interface ZodString extends ZodType<string> {
    min(min: number, message?: string): this;
    max(max: number, message?: string): this;
    email(message?: string): this;
    url(message?: string): this;
    uuid(message?: string): this;
    regex(regex: RegExp, message?: string): this;
    default(value: string): this;
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
  }

  export interface ZodNumber extends ZodType<number> {
    min(min: number, message?: string): this;
    max(max: number, message?: string): this;
    int(message?: string): this;
    positive(message?: string): this;
    negative(message?: string): this;
    default(value: number): this;
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
  }

  export interface ZodBoolean extends ZodType<boolean> {
    default(value: boolean): this;
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
  }

  export interface ZodDate extends ZodType<Date> {
    min(min: Date, message?: string): this;
    max(max: Date, message?: string): this;
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
  }

  export interface ZodArray<T> extends ZodType<any[]> {
    min(min: number, message?: string): this;
    max(max: number, message?: string): this;
    length(length: number, message?: string): this;
    nonempty(message?: string): this;
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
  }

  export interface ZodObject<T> extends ZodType<any> {
    extend<U>(shape: U): ZodObject<T & U>;
    merge<U>(other: ZodObject<U>): ZodObject<T & U>;
    pick<K extends keyof T>(keys: K[]): ZodObject<Pick<T, K>>;
    omit<K extends Record<string, true>>(keys: K): ZodObject<any>;
    partial(): ZodObject<Partial<T>>;
    refine(check: (data: any) => any, options?: { message?: string; path?: string[] }): ZodType<any>;
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
    parse(data: unknown): any;
    safeParse(data: unknown): { success: true; data: any } | { success: false; error: ZodError };
  }

  export interface ZodEnum<T> extends ZodType<any> {
    default(value: any): this;
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
  }

  export interface ZodUnion<T> extends ZodType<any> {
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
  }

  export interface ZodOptional<T> extends ZodType<any> {
    unwrap(): T;
  }

  export interface ZodNullable<T> extends ZodType<any> {
    unwrap(): T;
  }

  export interface ZodLiteral<T> extends ZodType<T> {
    value: T;
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
  }

  export interface ZodAny extends ZodType<any> {
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
  }

  export interface ZodUnknown extends ZodType<unknown> {
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
  }

  export interface ZodNever extends ZodType<never> {}
  export interface ZodVoid extends ZodType<void> {}
  export interface ZodRecord<T> extends ZodType<Record<string, any>> {}
  export interface ZodTuple<T> extends ZodType<any[]> {}

  // Infer helper type - uses _output from ZodType
  type ZodInfer<T extends ZodType<any>> = T['_output'];

  interface ZodNamespace {
    string: () => ZodString;
    number: () => ZodNumber;
    boolean: () => ZodBoolean;
    date: () => ZodDate;
    array: <T>(schema: T) => ZodArray<T>;
    object: <T extends Record<string, any>>(shape: T) => ZodObject<T>;
    enum: <T extends readonly [string, ...string[]]>(values: T) => ZodEnum<T>;
    union: <T extends readonly [any, any, ...any[]]>(schemas: T) => ZodUnion<T>;
    optional: <T>(schema: T) => ZodOptional<T>;
    nullable: <T>(schema: T) => ZodNullable<T>;
    literal: <T>(value: T) => ZodLiteral<T>;
    any: () => ZodAny;
    unknown: () => ZodUnknown;
    never: () => ZodNever;
    void: () => ZodVoid;
    record: <T>(schema: T) => ZodRecord<T>;
    tuple: <T extends readonly [any, ...any[]]>(schemas: T) => ZodTuple<T>;
    ZodType: ZodType;
    ZodError: ZodError;
  }

  // Support for z.infer<T> type usage
  export namespace z {
    type infer<T extends ZodType<any>> = T['_output'];
  }

  export const z: ZodNamespace;
  export default z;
  export { ZodType, ZodError };
}

// ==================== React-toastify ====================
declare module 'react-toastify' {
  import { ReactNode } from 'react';

  export interface ToastOptions {
    type?: 'info' | 'success' | 'warning' | 'error' | 'default';
    position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
    autoClose?: number | false;
    hideProgressBar?: boolean;
    closeOnClick?: boolean;
    pauseOnHover?: boolean;
    draggable?: boolean;
    progress?: number;
    theme?: 'light' | 'dark' | 'colored';
  }

  export const toast: {
    (content: ReactNode, options?: ToastOptions): number | string;
    success(content: ReactNode, options?: ToastOptions): number | string;
    error(content: ReactNode, options?: ToastOptions): number | string;
    info(content: ReactNode, options?: ToastOptions): number | string;
    warning(content: ReactNode, options?: ToastOptions): number | string;
    dismiss(id?: number | string): void;
  };

  export const ToastContainer: React.FC<{
    position?: string;
    autoClose?: number;
    hideProgressBar?: boolean;
    newestOnTop?: boolean;
    closeOnClick?: boolean;
    rtl?: boolean;
    pauseOnFocusLoss?: boolean;
    draggable?: boolean;
    pauseOnHover?: boolean;
    theme?: 'light' | 'dark' | 'colored';
  }>;
}
