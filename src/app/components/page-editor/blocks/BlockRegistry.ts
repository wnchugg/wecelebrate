/**
 * Block Registry for managing block types
 * Requirements: 4.1, 4.2, 6.1, 6.2
 */

import { BlockType, BlockDefinition, Block, BlockContent } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Block Registry class for managing available block types
 */
export class BlockRegistry {
  private blocks: Map<BlockType, BlockDefinition>;

  constructor() {
    this.blocks = new Map();
  }

  /**
   * Register a new block type
   */
  register(type: BlockType, definition: BlockDefinition): void {
    // Validate block definition
    if (!definition.label || !definition.description) {
      throw new Error(`Block definition for ${type} must include label and description`);
    }

    if (!definition.icon) {
      throw new Error(`Block definition for ${type} must include an icon component`);
    }

    if (!definition.defaultContent || typeof definition.defaultContent !== 'object') {
      throw new Error(`Block definition for ${type} must include default content`);
    }

    if (!definition.defaultStyles || typeof definition.defaultStyles !== 'object') {
      throw new Error(`Block definition for ${type} must include default styles`);
    }

    if (!definition.contentSchema || typeof definition.contentSchema !== 'object') {
      throw new Error(`Block definition for ${type} must include content schema`);
    }

    if (!definition.renderPreview || typeof definition.renderPreview !== 'function') {
      throw new Error(`Block definition for ${type} must include renderPreview function`);
    }

    if (!definition.renderEditor || typeof definition.renderEditor !== 'function') {
      throw new Error(`Block definition for ${type} must include renderEditor function`);
    }

    this.blocks.set(type, definition);
  }

  /**
   * Unregister a block type
   */
  unregister(type: BlockType): void {
    this.blocks.delete(type);
  }

  /**
   * Get a block definition by type
   */
  get(type: BlockType): BlockDefinition | undefined {
    return this.blocks.get(type);
  }

  /**
   * Get all registered block definitions
   */
  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  /**
   * Get block definitions by category
   */
  getByCategory(category: string): BlockDefinition[] {
    return this.getAll().filter((def) => def.category === category);
  }

  /**
   * Create a new block instance with default content
   */
  createBlock(type: BlockType): Block {
    const definition = this.get(type);
    
    if (!definition) {
      throw new Error(`Block type ${type} is not registered`);
    }

    // Deep clone default content and styles to avoid mutations
    const content = JSON.parse(JSON.stringify(definition.defaultContent)) as BlockContent;
    const styles = JSON.parse(JSON.stringify(definition.defaultStyles));

    const block: Block = {
      id: uuidv4(),
      type,
      content,
      styles,
    };

    // Add children array for blocks that allow children
    if (definition.allowChildren) {
      block.children = [];
    }

    return block;
  }

  /**
   * Check if a block type is registered
   */
  has(type: BlockType): boolean {
    return this.blocks.has(type);
  }

  /**
   * Get all registered block types
   */
  getTypes(): BlockType[] {
    return Array.from(this.blocks.keys());
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.getAll().forEach((def) => {
      if (def.category) {
        categories.add(def.category);
      }
    });
    return Array.from(categories);
  }

  /**
   * Clear all registered blocks
   */
  clear(): void {
    this.blocks.clear();
  }
}

/**
 * Global block registry instance
 */
export const blockRegistry = new BlockRegistry();
