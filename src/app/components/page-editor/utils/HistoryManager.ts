/**
 * History Manager for undo/redo functionality
 * Requirements: 19.6, 19.7
 */

import { PageConfiguration, ConfigurationHistory } from '../core/types';

/**
 * Manages configuration history for undo/redo operations
 */
export class HistoryManager {
  private history: ConfigurationHistory;

  constructor(initialConfig: PageConfiguration, maxSize: number = 50) {
    this.history = {
      past: [],
      present: initialConfig,
      future: [],
      maxSize,
    };
  }

  /**
   * Push a new configuration state to history
   */
  push(config: PageConfiguration): void {
    // Add current state to past
    this.history.past.push(this.history.present);

    // Limit past history size
    if (this.history.past.length > this.history.maxSize) {
      this.history.past.shift();
    }

    // Set new present
    this.history.present = config;

    // Clear future (can't redo after new action)
    this.history.future = [];
  }

  /**
   * Undo the last change
   * Returns the previous configuration or null if can't undo
   */
  undo(): PageConfiguration | null {
    if (!this.canUndo()) {
      return null;
    }

    // Move current to future
    this.history.future.unshift(this.history.present);

    // Get previous state
    const previous = this.history.past.pop()!;
    this.history.present = previous;

    return previous;
  }

  /**
   * Redo the last undone change
   * Returns the next configuration or null if can't redo
   */
  redo(): PageConfiguration | null {
    if (!this.canRedo()) {
      return null;
    }

    // Move current to past
    this.history.past.push(this.history.present);

    // Get next state
    const next = this.history.future.shift()!;
    this.history.present = next;

    return next;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.history.past.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.history.future.length > 0;
  }

  /**
   * Get current configuration
   */
  getCurrent(): PageConfiguration {
    return this.history.present;
  }

  /**
   * Get the full history object
   */
  getHistory(): ConfigurationHistory {
    return this.history;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history.past = [];
    this.history.future = [];
  }

  /**
   * Reset history with a new configuration
   */
  reset(config: PageConfiguration): void {
    this.history.past = [];
    this.history.present = config;
    this.history.future = [];
  }

  /**
   * Get the number of undo steps available
   */
  getUndoCount(): number {
    return this.history.past.length;
  }

  /**
   * Get the number of redo steps available
   */
  getRedoCount(): number {
    return this.history.future.length;
  }
}
