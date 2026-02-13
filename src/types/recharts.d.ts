// Type definitions for recharts components
declare module 'recharts' {
  import { ComponentType, CSSProperties, ReactElement, ReactNode } from 'react';

  export interface CartesianGridProps {
    strokeDasharray?: string;
    stroke?: string;
    className?: string;
    vertical?: boolean;
    horizontal?: boolean;
  }

  export interface XAxisProps {
    dataKey?: string;
    stroke?: string;
    fontSize?: number;
    tickLine?: boolean;
    axisLine?: boolean;
  }

  export interface YAxisProps {
    stroke?: string;
    fontSize?: number;
    tickLine?: boolean;
    axisLine?: boolean;
    tickFormatter?: (value: any) => string;
  }

  export interface TooltipProps<TValue extends any = any, TName extends any = any> {
    cursor?: boolean | object;
    content?: ReactElement | ComponentType<any>;
    contentStyle?: CSSProperties;
    labelStyle?: CSSProperties;
  }

  export interface LegendProps {
    content?: ComponentType<any>;
    iconType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
  }

  export interface LineProps {
    type?: 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey: string;
    stroke?: string;
    strokeWidth?: number;
    dot?: boolean | object | ReactElement;
    activeDot?: boolean | object | ReactElement;
    name?: string;
  }

  export interface BarProps {
    dataKey: string;
    fill?: string;
    radius?: number | [number, number, number, number];
    name?: string;
    stackId?: string;
    children?: ReactNode;
  }

  export interface AreaProps {
    type?: 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey: string;
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
    name?: string;
    stackId?: string;
  }

  export interface PieProps {
    data: any[];
    dataKey: string;
    nameKey?: string;
    cx?: string | number;
    cy?: string | number;
    outerRadius?: number;
    innerRadius?: number;
    fill?: string;
    label?: boolean | ReactElement | ((entry: any) => ReactNode);
    labelLine?: boolean;
    children?: ReactNode;
  }

  export interface CellProps {
    fill?: string;
  }

  export interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    minHeight?: string | number;
    aspect?: number;
    debounce?: number;
    children: ReactNode;
  }

  export interface LineChartProps {
    width?: number;
    height?: number;
    data: any[];
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    children?: ReactNode;
  }

  export interface BarChartProps {
    width?: number;
    height?: number;
    data: any[];
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    children?: ReactNode;
  }

  export interface AreaChartProps {
    width?: number;
    height?: number;
    data: any[];
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    children?: ReactNode;
  }

  export interface PieChartProps {
    width?: number;
    height?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    children?: ReactNode;
  }

  export interface RadarChartProps {
    width?: number;
    height?: number;
    data: any[];
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    children?: ReactNode;
  }

  export interface PolarGridProps {
    stroke?: string;
    strokeDasharray?: string;
  }

  export interface PolarAngleAxisProps {
    dataKey?: string;
    stroke?: string;
    tick?: boolean | object;
  }

  export interface PolarRadiusAxisProps {
    angle?: number;
    domain?: [number, number];
    stroke?: string;
    tick?: boolean | object;
  }

  export interface RadarProps {
    name?: string;
    dataKey: string;
    stroke?: string;
    fill?: string;
    fillOpacity?: number;
  }

  export const ResponsiveContainer: ComponentType<ResponsiveContainerProps>;
  export const LineChart: ComponentType<LineChartProps>;
  export const BarChart: ComponentType<BarChartProps>;
  export const AreaChart: ComponentType<AreaChartProps>;
  export const PieChart: ComponentType<PieChartProps>;
  export const RadarChart: ComponentType<RadarChartProps>;
  export const CartesianGrid: ComponentType<CartesianGridProps>;
  export const XAxis: ComponentType<XAxisProps>;
  export const YAxis: ComponentType<YAxisProps>;
  export const Tooltip: ComponentType<TooltipProps>;
  export const Legend: ComponentType<LegendProps>;
  export const Line: ComponentType<LineProps>;
  export const Bar: ComponentType<BarProps>;
  export const Area: ComponentType<AreaProps>;
  export const Pie: ComponentType<PieProps>;
  export const Cell: ComponentType<CellProps>;
  export const PolarGrid: ComponentType<PolarGridProps>;
  export const PolarAngleAxis: ComponentType<PolarAngleAxisProps>;
  export const PolarRadiusAxis: ComponentType<PolarRadiusAxisProps>;
  export const Radar: ComponentType<RadarProps>;
}