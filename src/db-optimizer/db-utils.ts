/**
 * Database connection utilities.
 */

import pg from 'pg';
const { Pool } = pg;

export interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  connectionString?: string;
}

export class DatabaseConnection {
  private host: string;
  private port: number;
  private database: string;
  private user: string;
  private password: string;
  private connectionString?: string;
  private pool: pg.Pool | null = null;

  constructor(config: DatabaseConfig = {}) {
    // Support both individual config and connection string
    this.connectionString = config.connectionString || process.env.DATABASE_URL;
    
    this.host = config.host || process.env.DB_HOST || 'localhost';
    this.port = config.port || parseInt(process.env.DB_PORT || '5432', 10);
    this.database = config.database || process.env.DB_NAME || 'postgres';
    this.user = config.user || process.env.DB_USER || 'postgres';
    this.password = config.password || process.env.DB_PASSWORD || '';
  }

  /**
   * Establish database connection.
   */
  async connect(): Promise<void> {
    if (this.pool) {
      return; // Already connected
    }

    try {
      if (this.connectionString) {
        // Use connection string if provided
        this.pool = new Pool({
          connectionString: this.connectionString,
          ssl: this.connectionString.includes('supabase.co') 
            ? { rejectUnauthorized: false } 
            : undefined,
        });
      } else {
        // Use individual config
        this.pool = new Pool({
          host: this.host,
          port: this.port,
          database: this.database,
          user: this.user,
          password: this.password,
          ssl: this.host.includes('supabase.co') 
            ? { rejectUnauthorized: false } 
            : undefined,
        });
      }

      // Test the connection
      const client = await this.pool.connect();
      client.release();
    } catch (error) {
      throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Close database connection.
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  /**
   * Execute a query and return results.
   */
  async executeQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
    if (!this.pool) {
      await this.connect();
    }

    try {
      const result = await this.pool!.query(query, params);
      return result.rows as T[];
    } catch (error) {
      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get RLS policy definition from pg_policies.
   */
  async getPolicyDefinition(
    schema: string,
    table: string,
    policyName: string
  ): Promise<{
    schemaname: string;
    tablename: string;
    policyname: string;
    permissive: string; // 'PERMISSIVE' or 'RESTRICTIVE'
    roles: string[];
    cmd: string; // 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALL'
    qual: string; // USING clause
    with_check: string | null; // WITH CHECK clause
  } | null> {
    const query = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = $1 AND tablename = $2 AND policyname = $3
    `;

    try {
      const results = await this.executeQuery(query, [schema, table, policyName]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Failed to get policy definition for ${schema}.${table}.${policyName}:`, error);
      return null;
    }
  }

  /**
   * Get index definition from pg_indexes.
   */
  async getIndexDefinition(
    schema: string,
    table: string,
    indexName: string
  ): Promise<{
    schemaname: string;
    tablename: string;
    indexname: string;
    indexdef: string;
  } | null> {
    const query = `
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = $1 AND tablename = $2 AND indexname = $3
    `;

    try {
      const results = await this.executeQuery(query, [schema, table, indexName]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Failed to get index definition for ${schema}.${table}.${indexName}:`, error);
      return null;
    }
  }

  /**
   * Get index usage statistics from pg_stat_user_indexes.
   */
  async getIndexUsageStats(
    schema: string,
    table: string,
    indexName: string
  ): Promise<{
    schemaname: string;
    tablename: string;
    indexname: string;
    idx_scan: number;
    idx_tup_read: number;
    idx_tup_fetch: number;
  } | null> {
    const query = `
      SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE schemaname = $1 AND tablename = $2 AND indexname = $3
    `;

    try {
      const results = await this.executeQuery(query, [schema, table, indexName]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Failed to get index usage stats for ${schema}.${table}.${indexName}:`, error);
      return null;
    }
  }

  /**
   * Get foreign key column information.
   */
  async getForeignKeyColumns(fkName: string): Promise<Array<{ columnName: string; columnPosition: number }>> {
    const query = `
      SELECT
        a.attname as column_name,
        a.attnum as column_position
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      WHERE c.contype = 'f'
        AND c.conname = $1
      ORDER BY array_position(c.conkey, a.attnum)
    `;

    try {
      const results = await this.executeQuery<{ column_name: string; column_position: number }>(query, [fkName]);
      return results.map(row => ({
        columnName: row.column_name,
        columnPosition: row.column_position,
      }));
    } catch (error) {
      console.error(`Failed to get foreign key columns for ${fkName}:`, error);
      return [];
    }
  }

  /**
   * Check if connection is established.
   */
  isConnected(): boolean {
    return this.pool !== null;
  }
}

