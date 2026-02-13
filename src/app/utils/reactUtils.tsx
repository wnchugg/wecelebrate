/**
 * React Component Utilities
 * Provides utilities for React component development
 */

import React, { ComponentType, ReactNode, ReactElement } from 'react';
import ReactDOM from 'react-dom';

/**
 * Create a compound component context
 */
export function createCompoundContext<T>(displayName: string) {
  const Context = React.createContext<T | undefined>(undefined);
  Context.displayName = displayName;
  
  function useContext() {
    const context = React.useContext(Context);
    if (context === undefined) {
      throw new Error(`useContext must be used within ${displayName}Provider`);
    }
    return context;
  }
  
  return [Context.Provider, useContext, Context] as const;
}

/**
 * Create a component with display name
 */
export function createComponent<P = {}>(
  Component: ComponentType<P>,
  displayName: string
): ComponentType<P> {
  Component.displayName = displayName;
  return Component;
}

/**
 * Compose multiple refs
 */
export function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T>).current = node;
      }
    });
  };
}

/**
 * Create a polymorphic component (component that can render as different elements)
 */
export type PolymorphicComponentProps<
  E extends React.ElementType,
  P = {}
> = P & Omit<React.ComponentPropsWithoutRef<E>, keyof P> & {
  as?: E;
};

/**
 * Create a forward ref component with generic props
 */
export function createForwardRef<T, P = {}>(
  render: (props: React.PropsWithoutRef<P>, ref: React.Ref<T>) => ReactElement | null
) {
  return React.forwardRef(render) as (
    props: P & React.RefAttributes<T>
  ) => ReactElement | null;
}

/**
 * Render children as a function or element
 */
export function renderChildren(
  children: ReactNode | ((props: any) => ReactNode),
  props?: any
): ReactNode {
  if (typeof children === 'function') {
    return children(props);
  }
  return children;
}

/**
 * Get only valid React children
 */
export function getValidChildren(children: ReactNode): ReactElement[] {
  return React.Children.toArray(children).filter(
    child => React.isValidElement(child)
  ) as ReactElement[];
}

/**
 * Clone element with additional props
 */
export function cloneElementWithProps<P>(
  element: ReactElement<P>,
  props: Partial<P>
): ReactElement<P> {
  return React.cloneElement(element, props);
}

/**
 * Map children with index
 */
export function mapChildren(
  children: ReactNode,
  fn: (child: ReactElement, index: number) => ReactNode
): ReactNode[] {
  return React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return fn(child, index);
    }
    return child;
  }) || [];
}

/**
 * Filter children by type
 */
export function filterChildrenByType<P = any>(
  children: ReactNode,
  type: ComponentType<P>
): ReactElement<P>[] {
  return React.Children.toArray(children).filter(
    child => React.isValidElement(child) && child.type === type
  ) as ReactElement<P>[];
}

/**
 * Find child by type
 */
export function findChildByType<P = any>(
  children: ReactNode,
  type: ComponentType<P>
): ReactElement<P> | undefined {
  const found = React.Children.toArray(children).find(
    child => React.isValidElement(child) && child.type === type
  );
  return found as ReactElement<P> | undefined;
}

/**
 * Create a slot component system
 */
export function createSlots<T extends Record<string, any>>() {
  type SlotName = keyof T;
  
  function Slot({ name, children }: { name: SlotName; children?: ReactNode }) {
    return <>{children}</>;
  }
  
  function getSlot(children: ReactNode, name: SlotName): ReactNode {
    const slots = React.Children.toArray(children);
    const slot = slots.find(
      child =>
        React.isValidElement(child) &&
        child.type === Slot &&
        child.props.name === name
    );
    return React.isValidElement(slot) ? slot.props.children : null;
  }
  
  function hasSlot(children: ReactNode, name: SlotName): boolean {
    return getSlot(children, name) !== null;
  }
  
  return {
    Slot,
    getSlot,
    hasSlot,
  };
}

/**
 * Create a render prop component
 */
export function createRenderProp<P, R>(
  render: (props: P) => R
): (props: P & { children?: (result: R) => ReactNode }) => ReactElement {
  return ({ children, ...props }) => {
    const result = render(props as P);
    return <>{children ? children(result) : null}</>;
  };
}

/**
 * Merge props with defaults
 */
export function mergeProps<T extends Record<string, any>>(
  defaultProps: Partial<T>,
  props: T
): T {
  return { ...defaultProps, ...props };
}

/**
 * Create a controlled component wrapper
 */
export function createControlled<P extends { value?: any; onChange?: (value: any) => void }>(
  Component: ComponentType<P>
) {
  return function ControlledComponent({
    value: valueProp,
    defaultValue,
    onChange: onChangeProp,
    ...props
  }: P & { defaultValue?: any }) {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    
    const value = valueProp !== undefined ? valueProp : internalValue;
    const onChange = React.useCallback(
      (newValue: any) => {
        if (valueProp === undefined) {
          setInternalValue(newValue);
        }
        onChangeProp?.(newValue);
      },
      [valueProp, onChangeProp]
    );
    
    return <Component {...(props as P)} value={value} onChange={onChange} />;
  };
}

/**
 * Create a lazy loaded component
 */
export function createLazyComponent<P extends {} = {}>(
  factory: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
) {
  const LazyComponent = React.lazy(factory);
  
  return (props: P) => (
    <React.Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...(props as any)} />
    </React.Suspense>
  );
}

/**
 * Create an error boundary wrapper
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;
      
      if (typeof fallback === 'function') {
        return fallback(this.state.error);
      }
      
      return fallback || <div>Something went wrong</div>;
    }
    
    return this.props.children;
  }
}

/**
 * Create a portal component
 */
export function createPortal(
  children: ReactNode,
  container?: Element | null
): ReactNode {
  if (typeof document === 'undefined') return null;
  
  const portalContainer = container || document.body;
  return ReactDOM.createPortal(children, portalContainer);
}

/**
 * Create a memo component with custom comparison
 */
export function createMemoComponent<P extends {}>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<ComponentType<P>> {
  return React.memo(Component, areEqual);
}

/**
 * Create a HOC (Higher Order Component)
 */
export function createHOC<P, HP = {}>(
  enhance: (Component: ComponentType<P>) => ComponentType<P & HP>
) {
  return (Component: ComponentType<P>) => {
    const Enhanced = enhance(Component);
    Enhanced.displayName = `withHOC(${Component.displayName || Component.name})`;
    return Enhanced;
  };
}

/**
 * Merge class names
 */
export function mergeClassNames(...classNames: (string | undefined | null | false)[]): string {
  return classNames.filter(Boolean).join(' ');
}

/**
 * Create a component factory
 */
export function createComponentFactory<P = {}>(
  displayName: string,
  defaultProps?: Partial<P>
) {
  return function factory(
    render: (props: P) => ReactElement | null
  ): ComponentType<P> {
    const Component = (props: P) => {
      const mergedProps = { ...defaultProps, ...props };
      return render(mergedProps);
    };
    
    Component.displayName = displayName;
    return Component;
  };
}

/**
 * Type guard for React element
 */
export function isReactElement(value: any): value is ReactElement {
  return React.isValidElement(value);
}

/**
 * Type guard for React component
 */
export function isReactComponent(value: any): value is ComponentType {
  return (
    typeof value === 'function' ||
    (typeof value === 'object' && value !== null && '$$typeof' in value)
  );
}
