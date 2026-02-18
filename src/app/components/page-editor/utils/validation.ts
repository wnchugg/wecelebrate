/**
 * Configuration validation utilities
 * Requirements: 11.3, 14.7
 */

import {
  PageConfiguration,
  ValidationResult,
  ValidationError,
  ValidationRule,
} from '../core/types';
import { Block } from '../blocks/types';
import { VisualField } from '../modes/types';

/**
 * Configuration validator class
 */
export class ConfigurationValidator {
  /**
   * Validate a complete page configuration
   */
  validate(config: PageConfiguration): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate version
    if (!config.version || typeof config.version !== 'string') {
      errors.push({
        field: 'version',
        message: 'Configuration version is required and must be a string',
      });
    }

    // Validate mode
    if (!config.mode || !['visual', 'blocks', 'custom'].includes(config.mode)) {
      errors.push({
        field: 'mode',
        message: 'Mode must be one of: visual, blocks, custom',
      });
    }

    // Validate mode-specific configuration
    if (config.mode === 'visual' && !config.visual) {
      errors.push({
        field: 'visual',
        message: 'Visual configuration is required when mode is visual',
      });
    }

    if (config.mode === 'blocks') {
      if (!config.blocks) {
        errors.push({
          field: 'blocks',
          message: 'Blocks array is required when mode is blocks',
        });
      } else if (!Array.isArray(config.blocks)) {
        errors.push({
          field: 'blocks',
          message: 'Blocks must be an array',
        });
      } else {
        // Validate each block
        config.blocks.forEach((block, index) => {
          const blockErrors = this.validateBlock(block);
          blockErrors.errors.forEach((error) => {
            errors.push({
              field: `blocks[${index}].${error.field}`,
              message: error.message,
            });
          });
        });
      }
    }

    if (config.mode === 'custom' && !config.custom) {
      errors.push({
        field: 'custom',
        message: 'Custom code configuration is required when mode is custom',
      });
    }

    // Validate custom code structure
    if (config.custom) {
      if (typeof config.custom.html !== 'string') {
        errors.push({
          field: 'custom.html',
          message: 'Custom HTML must be a string',
        });
      }
      if (typeof config.custom.css !== 'string') {
        errors.push({
          field: 'custom.css',
          message: 'Custom CSS must be a string',
        });
      }
      if (typeof config.custom.javascript !== 'string') {
        errors.push({
          field: 'custom.javascript',
          message: 'Custom JavaScript must be a string',
        });
      }
    }

    // Validate metadata if present
    if (config.metadata) {
      if (config.metadata.lastModified && typeof config.metadata.lastModified !== 'string') {
        errors.push({
          field: 'metadata.lastModified',
          message: 'Last modified must be a string',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a single block
   */
  validateBlock(block: Block, depth: number = 0, maxDepth: number = 10): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate required fields
    if (!block.id || typeof block.id !== 'string') {
      errors.push({
        field: 'id',
        message: 'Block ID is required and must be a string',
      });
    }

    if (!block.type || typeof block.type !== 'string') {
      errors.push({
        field: 'type',
        message: 'Block type is required and must be a string',
      });
    }

    if (!block.content || typeof block.content !== 'object') {
      errors.push({
        field: 'content',
        message: 'Block content is required and must be an object',
      });
    }

    if (!block.styles || typeof block.styles !== 'object') {
      errors.push({
        field: 'styles',
        message: 'Block styles is required and must be an object',
      });
    }

    // Validate nesting depth
    if (depth > maxDepth) {
      errors.push({
        field: 'children',
        message: `Block nesting depth exceeds maximum of ${maxDepth}`,
      });
    }

    // Validate children if present
    if (block.children) {
      if (!Array.isArray(block.children)) {
        errors.push({
          field: 'children',
          message: 'Block children must be an array',
        });
      } else {
        // For layout blocks, children should be array of arrays
        if (block.type === 'layout') {
          block.children.forEach((child, index) => {
            if (Array.isArray(child)) {
              // Column array
              (child as Block[]).forEach((nestedBlock, nestedIndex) => {
                const childErrors = this.validateBlock(nestedBlock, depth + 1, maxDepth);
                childErrors.errors.forEach((error) => {
                  errors.push({
                    field: `children[${index}][${nestedIndex}].${error.field}`,
                    message: error.message,
                  });
                });
              });
            } else {
              // Regular block in children array
              const childErrors = this.validateBlock(child as Block, depth + 1, maxDepth);
              childErrors.errors.forEach((error) => {
                errors.push({
                  field: `children[${index}].${error.field}`,
                  message: error.message,
                });
              });
            }
          });
        } else {
          // Regular blocks
          block.children.forEach((child, index) => {
            const childErrors = this.validateBlock(child as Block, depth + 1, maxDepth);
            childErrors.errors.forEach((error) => {
              errors.push({
                field: `children[${index}].${error.field}`,
                message: error.message,
              });
            });
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a field value against validation rules
   */
  validateField(field: VisualField, value: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!field.validation || field.validation.length === 0) {
      return { valid: true, errors: [] };
    }

    for (const rule of field.validation) {
      const error = this.validateRule(rule, value, field.label);
      if (error) {
        errors.push(error);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a single validation rule
   */
  private validateRule(rule: ValidationRule, value: any, fieldLabel: string): ValidationError | null {
    switch (rule.type) {
      case 'required':
        if (value === null || value === undefined || value === '') {
          return {
            field: fieldLabel,
            message: rule.message || `${fieldLabel} is required`,
          };
        }
        break;

      case 'minLength':
        if (typeof value === 'string' && value.length < (rule.value || 0)) {
          return {
            field: fieldLabel,
            message: rule.message || `${fieldLabel} must be at least ${rule.value} characters`,
          };
        }
        break;

      case 'maxLength':
        if (typeof value === 'string' && value.length > (rule.value || 0)) {
          return {
            field: fieldLabel,
            message: rule.message || `${fieldLabel} must be at most ${rule.value} characters`,
          };
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && rule.value) {
          const regex = new RegExp(rule.value);
          if (!regex.test(value)) {
            return {
              field: fieldLabel,
              message: rule.message || `${fieldLabel} format is invalid`,
            };
          }
        }
        break;

      case 'custom':
        if (rule.validator && !rule.validator(value)) {
          return {
            field: fieldLabel,
            message: rule.message || `${fieldLabel} validation failed`,
          };
        }
        break;
    }

    return null;
  }
}

/**
 * Default validator instance
 */
export const configValidator = new ConfigurationValidator();
