/**
 * Backend Helper Function Tests
 * Phase 3: Backend Refactoring
 */

import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  camelToSnake,
  snakeToCamel,
  objectToSnakeCase,
  objectToCamelCase,
  isValidDate,
  generateId,
  generateToken,
} from '../helpers.ts';

// ===== Case Conversion Tests =====

Deno.test('camelToSnake - converts camelCase to snake_case', () => {
  assertEquals(camelToSnake('firstName'), 'first_name');
  assertEquals(camelToSnake('contactEmail'), 'contact_email');
  assertEquals(camelToSnake('userId'), 'user_id');
  assertEquals(camelToSnake('name'), 'name'); // No change for single word
});

Deno.test('snakeToCamel - converts snake_case to camelCase', () => {
  assertEquals(snakeToCamel('first_name'), 'firstName');
  assertEquals(snakeToCamel('contact_email'), 'contactEmail');
  assertEquals(snakeToCamel('user_id'), 'userId');
  assertEquals(snakeToCamel('name'), 'name'); // No change for single word
});

Deno.test('objectToSnakeCase - converts object keys', () => {
  const input = {
    firstName: 'John',
    lastName: 'Doe',
    contactEmail: 'john@example.com',
  };
  const expected = {
    first_name: 'John',
    last_name: 'Doe',
    contact_email: 'john@example.com',
  };
  assertEquals(objectToSnakeCase(input), expected);
});

Deno.test('objectToCamelCase - converts object keys', () => {
  const input = {
    first_name: 'John',
    last_name: 'Doe',
    contact_email: 'john@example.com',
  };
  const expected = {
    firstName: 'John',
    lastName: 'Doe',
    contactEmail: 'john@example.com',
  };
  assertEquals(objectToCamelCase(input), expected);
});

// ===== Date Validation Tests =====

Deno.test('isValidDate - valid dates', () => {
  assertEquals(isValidDate('2024-01-15'), true);
  assertEquals(isValidDate('2024-01-15T10:30:00Z'), true);
  assertEquals(isValidDate(new Date().toISOString()), true);
});

Deno.test('isValidDate - invalid dates', () => {
  assertEquals(isValidDate('not-a-date'), false);
  assertEquals(isValidDate('2024-13-01'), false); // Invalid month
  assertEquals(isValidDate(''), false);
});

// ===== ID Generation Tests =====

Deno.test('generateId - generates valid UUID', () => {
  const id = generateId();
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  assertEquals(uuidRegex.test(id), true);
});

Deno.test('generateId - generates unique IDs', () => {
  const id1 = generateId();
  const id2 = generateId();
  assertEquals(id1 === id2, false);
});

Deno.test('generateToken - generates token of correct length', () => {
  const token16 = generateToken(16);
  const token32 = generateToken(32);
  assertEquals(token16.length, 32); // 16 bytes = 32 hex chars
  assertEquals(token32.length, 64); // 32 bytes = 64 hex chars
});

Deno.test('generateToken - generates unique tokens', () => {
  const token1 = generateToken();
  const token2 = generateToken();
  assertEquals(token1 === token2, false);
});

Deno.test('generateToken - only contains hex characters', () => {
  const token = generateToken();
  const hexRegex = /^[0-9a-f]+$/;
  assertEquals(hexRegex.test(token), true);
});
