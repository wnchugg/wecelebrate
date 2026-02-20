/**
 * Main PageEditor Component
 * Requirements: 1.1, 1.2, 1.5
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  PageEditorProps,
  PageEditorState,
  PageConfiguration,
  EditorMode,
} from './types';
import { DeviceMode } from '../preview/types';
import { HistoryManager } from '../utils/HistoryManager';
import { EditorHeader } from './EditorHeader';
import { ModeSelector } from './ModeSelector';
import { VisualEditor } from '../modes/VisualEditor';
import { BlocksEditor } from '../modes/BlocksEditor';
import { CustomCodeEditor } from '../modes/CustomCodeEditor';
import { PreviewPanel } from '../preview/PreviewPanel';
import { blockRegistry, registerStandardBlocks } from '../blocks';

/**
 * Error Boundary for PageEditor
 */
class PageEditorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[PageEditor] Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main PageEditor Component
 */
export const PageEditor: React.FC<PageEditorProps> = ({
  pageType,
  pageId,
  defaultConfig,
  visualConfig,
  allowedBlockTypes,
  allowedModes = ['visual', 'blocks', 'custom'],
  storageAdapter,
  storageKey,
  onSave,
  onLoad,
  onChange,
  enableDragDrop = false,
  enableLayouts = false,
  enableTemplates = false,
  enableGlobalBlocks = false,
  maxNestingDepth = 5,
}) => {
  // State management
  const [state, setState] = useState<PageEditorState>({
    config: defaultConfig,
    mode: defaultConfig.mode || 'visual',
    selectedBlockId: null,
    previewDevice: 'desktop',
    hasChanges: false,
    saveStatus: 'idle',
    history: {
      past: [],
      present: defaultConfig,
      future: [],
      maxSize: 50,
    },
    dragState: null,
  });

  const [historyManager] = useState(() => new HistoryManager(defaultConfig));
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Register standard blocks on mount
   */
  useEffect(() => {
    if (blockRegistry.getAll().length === 0) {
      registerStandardBlocks(blockRegistry);
    }
  }, []);

  /**
   * Load saved configuration on mount
   */
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        setIsLoading(true);
        const savedConfig = await storageAdapter.load(storageKey);

        if (savedConfig) {
          setState((prev) => ({
            ...prev,
            config: savedConfig,
            mode: savedConfig.mode || prev.mode,
          }));
          historyManager.reset(savedConfig);

          if (onLoad) {
            onLoad(savedConfig);
          }
        }
      } catch (error) {
        console.error('[PageEditor] Failed to load configuration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfiguration();
  }, [storageAdapter, storageKey, onLoad]);

  /**
   * Warn user before leaving with unsaved changes
   * Requirement: 10.6
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasChanges) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.hasChanges]);

  /**
   * Update configuration
   */
  const updateConfiguration = useCallback(
    (updates: Partial<PageConfiguration>) => {
      setState((prev) => {
        const newConfig = { ...prev.config, ...updates };

        // Add to history
        historyManager.push(newConfig);

        // Mark as changed
        const hasChanges = true;

        // Notify parent
        if (onChange) {
          onChange(newConfig);
        }

        return {
          ...prev,
          config: newConfig,
          hasChanges,
          history: historyManager.getHistory(),
        };
      });
    },
    [onChange, historyManager]
  );

  /**
   * Switch editor mode
   */
  const switchMode = useCallback(
    (mode: EditorMode) => {
      setState((prev) => {
        const newConfig = { ...prev.config, mode };

        // Add to history
        historyManager.push(newConfig);

        // Notify parent
        if (onChange) {
          onChange(newConfig);
        }

        return {
          ...prev,
          config: newConfig,
          mode, // Update both config.mode and state.mode
          hasChanges: true,
          history: historyManager.getHistory(),
        };
      });
    },
    [onChange, historyManager]
  );

  /**
   * Select a block for editing
   */
  const selectBlock = useCallback((blockId: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedBlockId: blockId,
    }));
  }, []);

  /**
   * Undo last change
   */
  const undo = useCallback(() => {
    const previousConfig = historyManager.undo();
    if (previousConfig) {
      setState((prev) => ({
        ...prev,
        config: previousConfig,
        hasChanges: true,
        history: historyManager.getHistory(),
      }));

      if (onChange) {
        onChange(previousConfig);
      }
    }
  }, [onChange, historyManager]);

  /**
   * Redo last undone change
   */
  const redo = useCallback(() => {
    const nextConfig = historyManager.redo();
    if (nextConfig) {
      setState((prev) => ({
        ...prev,
        config: nextConfig,
        hasChanges: true,
        history: historyManager.getHistory(),
      }));

      if (onChange) {
        onChange(nextConfig);
      }
    }
  }, [onChange, historyManager]);

  /**
   * Save configuration
   */
  const saveConfiguration = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, saveStatus: 'saving' }));

      await storageAdapter.save(storageKey, state.config);

      if (onSave) {
        await onSave(state.config);
      }

      setState((prev) => ({
        ...prev,
        hasChanges: false,
        saveStatus: 'saved',
      }));

      // Reset status after 2 seconds
      setTimeout(() => {
        setState((prev) => ({ ...prev, saveStatus: 'idle' }));
      }, 2000);
    } catch (error) {
      console.error('[PageEditor] Failed to save configuration:', error);
      setState((prev) => ({ ...prev, saveStatus: 'error' }));
    }
  }, [storageAdapter, storageKey, state.config, onSave]);

  /**
   * Reset to default configuration
   */
  const resetConfiguration = useCallback(() => {
    if (
      window.confirm(
        'Are you sure you want to reset to default configuration? This cannot be undone.'
      )
    ) {
      setState((prev) => ({
        ...prev,
        config: defaultConfig,
        hasChanges: true,
      }));
      historyManager.reset(defaultConfig);

      if (onChange) {
        onChange(defaultConfig);
      }
    }
  }, [defaultConfig, onChange, historyManager]);

  /**
   * Change preview device
   */
  const changePreviewDevice = useCallback((device: DeviceMode) => {
    setState((prev) => ({
      ...prev,
      previewDevice: device,
    }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page editor...</p>
        </div>
      </div>
    );
  }

  return (
    <PageEditorErrorBoundary>
      <div className="page-editor h-full flex flex-col">
        <EditorHeader
          hasChanges={state.hasChanges}
          saveStatus={state.saveStatus}
          onSave={saveConfiguration}
          onReset={resetConfiguration}
          canUndo={historyManager.canUndo()}
          canRedo={historyManager.canRedo()}
          onUndo={undo}
          onRedo={redo}
        />

        <ModeSelector
          currentMode={state.mode}
          allowedModes={allowedModes}
          onModeChange={switchMode}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Editor Panel */}
          <div className="w-1/2 border-r overflow-auto">
            {state.mode === 'visual' && visualConfig && (
              <VisualEditor
                config={visualConfig}
                values={state.config.visual || {}}
                onChange={(values) => updateConfiguration({ visual: values })}
              />
            )}

            {state.mode === 'blocks' && (
              <BlocksEditor
                blocks={state.config.blocks || []}
                onChange={(blocks) => updateConfiguration({ blocks })}
                allowedBlockTypes={allowedBlockTypes}
                enableDragDrop={enableDragDrop}
                enableLayouts={enableLayouts}
                maxNestingDepth={maxNestingDepth}
              />
            )}

            {state.mode === 'custom' && (
              <CustomCodeEditor
                html={state.config.custom?.html || ''}
                css={state.config.custom?.css || ''}
                javascript={state.config.custom?.javascript || ''}
                onChange={(updates) =>
                  updateConfiguration({
                    custom: { ...state.config.custom, ...updates } as any,
                  })
                }
              />
            )}
          </div>

          {/* Preview Panel */}
          <div className="w-1/2">
            <PreviewPanel
              config={state.config}
              device={state.previewDevice}
              onDeviceChange={changePreviewDevice}
              showDeviceControls={true}
              showExternalLink={false}
              pageType={pageType}
            />
          </div>
        </div>
      </div>
    </PageEditorErrorBoundary>
  );
};

export default PageEditor;
