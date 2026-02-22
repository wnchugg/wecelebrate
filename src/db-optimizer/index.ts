/**
 * Database Performance Optimization System
 * 
 * This package analyzes and optimizes database performance issues from Supabase's
 * linter output, generating safe SQL migration scripts.
 */

export * from './models';
export * from './parser';
export * from './analyzer';
export * from './optimizer';
export * from './validator';
export * from './estimator';
export * from './migration';
export * from './db-utils';

export const VERSION = '0.1.0';
