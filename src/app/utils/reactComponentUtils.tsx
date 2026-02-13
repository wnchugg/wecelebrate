/**
 * React Component Utilities
 * Helper functions for React components
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { 
  createElement, 
  isValidElement, 
  cloneElement,
  Children,
  type ReactNode, 
  type ReactElement,
  type ComponentType,
  type FC,
} from 'react';

/**
 * Check if value is a valid React element
 */
export function isReactElement(value: any): value is ReactElement {
  return isValidElement(value);
}

/**
 * Get display name of a component
 */
export function getDisplayName<P = any>(Component: ComponentType<P>): string {
  return Component.displayName || Component.name || 'Component';
}

/**
 * Create a component with display name
 */
export function createNamedComponent<P = {}>(
  name: string,
  component: FC<P>
): FC<P> {
  component.displayName = name;
  return component;
}

/**
 * Render children as function or element
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
 * Clone element with additional props
 */
export function cloneElementWithProps<P = any>(
  element: ReactElement<P>,
  additionalProps: Partial<P>
): ReactElement<P> {
  return cloneElement(element, additionalProps);
}

/**
 * Map children and clone with props
 */
export function mapChildrenWithProps<P = any>(
  children: ReactNode,
  additionalProps: Partial<P> | ((child: ReactElement<P>, index: number) => Partial<P>)
): ReactNode {
  return Children.map(children, (child, index) => {
    if (!isValidElement(child)) {
      return child;
    }
    
    const props = typeof additionalProps === 'function'
      ? additionalProps(child as ReactElement<P>, index)
      : additionalProps;
    
    return cloneElement(child, props);
  });
}

/**
 * Filter children by type
 */
export function filterChildrenByType<P = any>(
  children: ReactNode,
  type: ComponentType<P> | string
): Array<ReactElement<P>> {
  const result: Array<ReactElement<P>> = [];
  
  Children.forEach(children, child => {
    if (isValidElement(child) && child.type === type) {
      result.push(child as ReactElement<P>);
    }
  });
  
  return result;
}

/**
 * Find child by type
 */
export function findChildByType<P = any>(
  children: ReactNode,
  type: ComponentType<P> | string
): ReactElement<P> | null {
  let found: ReactElement<P> | null = null;
  
  Children.forEach(children, child => {
    if (!found && isValidElement(child) && child.type === type) {
      found = child as ReactElement<P>;
    }
  });
  
  return found;
}

/**
 * Count children
 */
export function countChildren(children: ReactNode): number {
  return Children.count(children);
}

/**
 * Check if has children
 */
export function hasChildren(children: ReactNode): boolean {
  return Children.count(children) > 0;
}

/**
 * Get only child (throws if multiple)
 */
export function getOnlyChild<P = any>(children: ReactNode): ReactElement<P> {
  return Children.only(children) as ReactElement<P>;
}

/**
 * Convert children to array
 */
export function childrenToArray(children: ReactNode): ReactNode[] {
  return Children.toArray(children);
}

/**
 * Flatten nested children
 */
export function flattenChildren(children: ReactNode): ReactNode[] {
  const result: ReactNode[] = [];
  
  Children.forEach(children, child => {
    if (isValidElement(child) && child.props.children) {
      result.push(...flattenChildren(child.props.children));
    } else {
      result.push(child);
    }
  });
  
  return result;
}

/**
 * Create compound component
 */
export function createCompoundComponent<
  MainProps,
  SubComponents extends Record<string, ComponentType<any>>
>(
  MainComponent: FC<MainProps>,
  subComponents: SubComponents
): FC<MainProps> & SubComponents {
  const compound = MainComponent as FC<MainProps> & SubComponents;
  
  Object.assign(compound, subComponents);
  
  return compound;
}

/**
 * Merge refs
 */
export function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (value: T) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T>).current = value;
      }
    });
  };
}

/**
 * Create context with hook
 */
export function createContextWithHook<T>(displayName: string): {
  Provider: FC<{ value: T; children: ReactNode }>;
  useContext: () => T;
} {
  const Context = React.createContext<T | undefined>(undefined);
  Context.displayName = displayName;

  const Provider: FC<{ value: T; children: ReactNode }> = ({ value, children }) => {
    return createElement(Context.Provider, { value }, children);
  };

  Provider.displayName = `${displayName}Provider`;

  const useContext = (): T => {
    const context = React.useContext(Context);
    if (context === undefined) {
      throw new Error(`use${displayName} must be used within ${displayName}Provider`);
    }
    return context;
  };

  return { Provider, useContext };
}

/**
 * Compose components (HOC)
 */
export function compose<P = any>(
  ...components: Array<ComponentType<any>>
): ComponentType<P> {
  return components.reduce(
    (Acc, Curr) => (props: P) => createElement(Curr, props as any, createElement(Acc, props)),
    ((props: P) => props) as any
  );
}

/**
 * Create lazy component with preload
 */
export function createLazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> } {
  const LazyComponent = React.lazy(factory) as any;
  LazyComponent.preload = factory;
  return LazyComponent;
}

/**
 * Render nothing
 */
export const Nothing: FC = () => null;

/**
 * Render children (passthrough)
 */
export const Fragment: FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;

/**
 * Conditional render
 */
export const If: FC<{ condition: boolean; children: ReactNode; fallback?: ReactNode }> = ({
  condition,
  children,
  fallback = null,
}) => {
  return <>{condition ? children : fallback}</>;
};

/**
 * Switch/Case render
 */
export const Switch: FC<{ value: any; children: ReactNode }> = ({ value, children }) => {
  let matchedCase: ReactNode = null;
  let defaultCase: ReactNode = null;
  
  Children.forEach(children, child => {
    if (!isValidElement(child)) return;
    
    if (child.type === Case) {
      if (child.props.value === value) {
        matchedCase = child.props.children;
      }
    } else if (child.type === Default) {
      defaultCase = child.props.children;
    }
  });
  
  return <>{matchedCase || defaultCase}</>;
};

export const Case: FC<{ value: any; children: ReactNode }> = ({ children }) => <>{children}</>;
export const Default: FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;

/**
 * Show component (only renders when visible)
 */
export const Show: FC<{ when: boolean; children: ReactNode; fallback?: ReactNode }> = ({
  when,
  children,
  fallback = null,
}) => {
  return <>{when ? children : fallback}</>;
};

/**
 * For loop component
 */
export function For<T>({
  each,
  fallback,
  children,
}: {
  each: T[] | null | undefined;
  fallback?: ReactNode;
  children: (item: T, index: number) => ReactNode;
}): ReactElement | null {
  if (!each || each.length === 0) {
    return <>{fallback}</> as ReactElement;
  }
  
  return <>{each.map((item, index) => children(item, index))}</> as ReactElement;
}

/**
 * Portal wrapper
 */
export const Portal: FC<{ children: ReactNode; container?: Element }> = ({
  children,
  container = document.body,
}) => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  if (!mounted) return null;
  
  return ReactDOM.createPortal(children, container);
};

/**
 * Slot component for composition
 */
export const Slot: FC<{ name?: string; children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

/**
 * Get slots from children
 */
export function getSlots(children: ReactNode): Record<string, ReactNode> {
  const slots: Record<string, ReactNode> = {};
  
  Children.forEach(children, child => {
    if (isValidElement(child) && child.type === Slot) {
      const name = child.props.name || 'default';
      slots[name] = child.props.children;
    }
  });
  
  return slots;
}
