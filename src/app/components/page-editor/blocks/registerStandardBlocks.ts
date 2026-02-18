/**
 * Register all standard block types
 * Requirements: 6.1
 */

import { BlockRegistry } from './BlockRegistry';
import { allBlockDefinitions } from './block-types';

/**
 * Register all standard block types with the registry
 */
export function registerStandardBlocks(registry: BlockRegistry): void {
  allBlockDefinitions.forEach((definition) => {
    registry.register(definition.type, definition);
  });
}
