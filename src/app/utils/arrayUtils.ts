/**
 * Array Utility Functions
 * Provides utilities for array manipulation and operations
 */

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Remove duplicates by key
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Flatten array
 */
export function flatten<T>(array: any[]): T[] {
  return array.flat(Infinity);
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random element from array
 */
export function sample<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get multiple random elements from array
 */
export function sampleSize<T>(array: T[], size: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(size, array.length));
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Count occurrences of each element
 */
export function countBy<T>(array: T[]): Map<T, number> {
  const counts = new Map<T, number>();
  array.forEach(item => {
    counts.set(item, (counts.get(item) || 0) + 1);
  });
  return counts;
}

/**
 * Partition array into two arrays based on predicate
 */
export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  
  array.forEach(item => {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  });
  
  return [pass, fail];
}

/**
 * Get intersection of arrays
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];
  
  const [first, ...rest] = arrays;
  return first.filter(item => rest.every(arr => arr.includes(item)));
}

/**
 * Get union of arrays
 */
export function union<T>(...arrays: T[][]): T[] {
  return unique(flatten(arrays));
}

/**
 * Get difference between arrays (items in first array but not in others)
 */
export function difference<T>(array: T[], ...arrays: T[][]): T[] {
  const others = flatten(arrays);
  return array.filter(item => !others.includes(item));
}

/**
 * Get symmetric difference (items in either array but not in both)
 */
export function symmetricDifference<T>(array1: T[], array2: T[]): T[] {
  return [
    ...array1.filter(item => !array2.includes(item)),
    ...array2.filter(item => !array1.includes(item)),
  ];
}

/**
 * Check if arrays are equal
 */
export function isEqual<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) return false;
  return array1.every((item, index) => item === array2[index]);
}

/**
 * Zip arrays together
 */
export function zip<T>(...arrays: T[][]): T[][] {
  const maxLength = Math.max(...arrays.map(arr => arr.length));
  const result: T[][] = [];
  
  for (let i = 0; i < maxLength; i++) {
    result.push(arrays.map(arr => arr[i]));
  }
  
  return result;
}

/**
 * Unzip array of arrays
 */
export function unzip<T>(array: T[][]): T[][] {
  if (array.length === 0) return [];
  const maxLength = Math.max(...array.map(arr => arr.length));
  const result: T[][] = [];
  
  for (let i = 0; i < maxLength; i++) {
    result.push(array.map(arr => arr[i]));
  }
  
  return result;
}

/**
 * Compact array (remove falsy values)
 */
export function compact<T>(array: (T | null | undefined | false | 0 | '')[]): T[] {
  return array.filter(Boolean) as T[];
}

/**
 * Take first n elements
 */
export function take<T>(array: T[], n: number): T[] {
  return array.slice(0, n);
}

/**
 * Take last n elements
 */
export function takeLast<T>(array: T[], n: number): T[] {
  return array.slice(-n);
}

/**
 * Take elements while predicate is true
 */
export function takeWhile<T>(array: T[], predicate: (item: T) => boolean): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (!predicate(item)) break;
    result.push(item);
  }
  return result;
}

/**
 * Drop first n elements
 */
export function drop<T>(array: T[], n: number): T[] {
  return array.slice(n);
}

/**
 * Drop last n elements
 */
export function dropLast<T>(array: T[], n: number): T[] {
  return array.slice(0, -n);
}

/**
 * Drop elements while predicate is true
 */
export function dropWhile<T>(array: T[], predicate: (item: T) => boolean): T[] {
  let index = 0;
  while (index < array.length && predicate(array[index])) {
    index++;
  }
  return array.slice(index);
}

/**
 * Fill array with value
 */
export function fill<T>(length: number, value: T | ((index: number) => T)): T[] {
  return Array.from({ length }, (_, index) =>
    typeof value === 'function' ? (value as (index: number) => T)(index) : value
  );
}

/**
 * Range of numbers
 */
export function range(start: number, end?: number, step: number = 1): number[] {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  
  const result: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else if (step < 0) {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }
  
  return result;
}

/**
 * Find index of element
 */
export function findIndex<T>(array: T[], predicate: (item: T) => boolean): number {
  return array.findIndex(predicate);
}

/**
 * Find last index of element
 */
export function findLastIndex<T>(array: T[], predicate: (item: T) => boolean): number {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) return i;
  }
  return -1;
}

/**
 * Move element in array
 */
export function move<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Swap elements in array
 */
export function swap<T>(array: T[], index1: number, index2: number): T[] {
  const result = [...array];
  [result[index1], result[index2]] = [result[index2], result[index1]];
  return result;
}

/**
 * Insert element at index
 */
export function insert<T>(array: T[], index: number, ...items: T[]): T[] {
  const result = [...array];
  result.splice(index, 0, ...items);
  return result;
}

/**
 * Remove element at index
 */
export function removeAt<T>(array: T[], index: number): T[] {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

/**
 * Remove elements by value
 */
export function remove<T>(array: T[], value: T): T[] {
  return array.filter(item => item !== value);
}

/**
 * Remove elements by predicate
 */
export function removeBy<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(item => !predicate(item));
}

/**
 * Update element at index
 */
export function updateAt<T>(array: T[], index: number, value: T): T[] {
  const result = [...array];
  result[index] = value;
  return result;
}

/**
 * Update elements by predicate
 */
export function updateBy<T>(
  array: T[],
  predicate: (item: T) => boolean,
  updater: (item: T) => T
): T[] {
  return array.map(item => (predicate(item) ? updater(item) : item));
}

/**
 * Rotate array
 */
export function rotate<T>(array: T[], count: number): T[] {
  const len = array.length;
  const n = ((count % len) + len) % len;
  return [...array.slice(n), ...array.slice(0, n)];
}

/**
 * Reverse array
 */
export function reverse<T>(array: T[]): T[] {
  return [...array].reverse();
}

/**
 * Intersperse element between array elements
 */
export function intersperse<T>(array: T[], separator: T): T[] {
  return array.reduce((result, item, index) => {
    if (index === 0) return [item];
    return [...result, separator, item];
  }, [] as T[]);
}

/**
 * Slice array with negative indices support
 */
export function sliceArray<T>(array: T[], start?: number, end?: number): T[] {
  return array.slice(start, end);
}

/**
 * Get first element
 */
export function first<T>(array: T[]): T | undefined {
  return array[0];
}

/**
 * Get last element
 */
export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

/**
 * Get nth element
 */
export function nth<T>(array: T[], index: number): T | undefined {
  return index < 0 ? array[array.length + index] : array[index];
}

/**
 * Check if array includes all values
 */
export function includesAll<T>(array: T[], values: T[]): boolean {
  return values.every(value => array.includes(value));
}

/**
 * Check if array includes any value
 */
export function includesAny<T>(array: T[], values: T[]): boolean {
  return values.some(value => array.includes(value));
}

/**
 * Check if array is empty
 */
export function isEmpty<T>(array: T[]): boolean {
  return array.length === 0;
}

/**
 * Check if array is not empty
 */
export function isNotEmpty<T>(array: T[]): boolean {
  return array.length > 0;
}

/**
 * Pluck property from array of objects
 */
export function pluck<T, K extends keyof T>(array: T[], key: K): T[K][] {
  return array.map(item => item[key]);
}

/**
 * Sum array of numbers
 */
export function sum(array: number[]): number {
  return array.reduce((acc, num) => acc + num, 0);
}

/**
 * Product of array of numbers
 */
export function product(array: number[]): number {
  return array.reduce((acc, num) => acc * num, 1);
}

/**
 * Min value in array
 */
export function min(array: number[]): number | undefined {
  return array.length > 0 ? Math.min(...array) : undefined;
}

/**
 * Max value in array
 */
export function max(array: number[]): number | undefined {
  return array.length > 0 ? Math.max(...array) : undefined;
}

/**
 * Average of array of numbers
 */
export function average(array: number[]): number {
  return array.length > 0 ? sum(array) / array.length : 0;
}
