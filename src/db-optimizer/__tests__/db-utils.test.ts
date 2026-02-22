/**
 * Tests for database utilities.
 */

import { describe, it, expect } from 'vitest';
import { DatabaseConnection } from '../db-utils';

describe('DatabaseConnection', () => {
  it('should initialize with defaults', () => {
    const conn = new DatabaseConnection();
    expect(conn).toBeDefined();
  });

  it('should initialize with custom config', () => {
    const conn = new DatabaseConnection({
      host: 'example.com',
      port: 5433,
      database: 'testdb',
      user: 'testuser',
      password: 'testpass',
    });
    expect(conn).toBeDefined();
  });
});
