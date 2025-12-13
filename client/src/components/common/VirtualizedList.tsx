/**
 * Virtualized List Component
 * Optimized for rendering large lists efficiently
 * Updated for react-window v2.2.3 API
 */

import { isValidElement } from "react";
import { List, Grid, type ListProps, type RowComponentProps, type CellComponentProps } from "react-window";
import { cn } from "@/lib/utils";

interface VirtualizedListProps<T> {
  items: T[];
  height?: number;
  itemHeight?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  overscanCount?: number;
}

export function VirtualizedList<T>({
  items,
  height = 600,
  itemHeight = 200,
  renderItem,
  className,
  itemClassName,
  emptyMessage = "No hay elementos para mostrar",
  emptyIcon,
  overscanCount = 5,
}: VirtualizedListProps<T>) {
  // Create row component as a function (not memoized) for react-window
  const Row = ({ index, style }: RowComponentProps) => {
    const item = items[index];
    if (!item) return null;

    try {
      const rendered = renderItem(item, index);
      // Ensure we return a valid React element
      if (!rendered) {
        return null;
      }
      
      // Check if it's a valid React element using React's isValidElement
      if (isValidElement(rendered)) {
        return (
          <div style={style} className={cn("px-2", itemClassName)}>
            {rendered}
          </div>
        );
      }
      
      // If it's a string or number, wrap it
      if (typeof rendered === 'string' || typeof rendered === 'number') {
        return (
          <div style={style} className={cn("px-2", itemClassName)}>
            {rendered}
          </div>
        );
      }
      
      // If it's a component (function/class), log error and return null
      if (typeof rendered === 'function' || (typeof rendered === 'object' && rendered !== null && 'render' in rendered)) {
        console.error("VirtualizedList: renderItem returned a component instead of an element. Index:", index, "Item:", item);
        return null;
      }
      
      return null;
    } catch (error) {
      console.error("Error rendering item:", error);
      return null;
    }
  };

  if (items.length === 0) {
    const EmptyIcon = emptyIcon;
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        {EmptyIcon && <EmptyIcon className="h-12 w-12 text-muted-foreground mb-4" />}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Use type assertion to avoid TypeScript error with react-window types
  const listProps = {
    rowCount: items.length,
    rowHeight: itemHeight,
    defaultHeight: height,
    overscanCount,
    rowComponent: Row,
    className: cn("w-full", className),
  } as any;

  return <List {...listProps} />;
}

/**
 * Virtualized Grid Component
 * For grid layouts with virtualization
 */
interface VirtualizedGridProps<T> {
  items: T[];
  height?: number;
  itemHeight?: number;
  columnCount?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  gap?: number;
}

export function VirtualizedGrid<T>({
  items,
  height = 600,
  itemHeight = 200,
  columnCount = 3,
  renderItem,
  className,
  itemClassName,
  emptyMessage = "No hay elementos para mostrar",
  emptyIcon,
  gap = 16,
}: VirtualizedGridProps<T>) {
  // Create cell component as a function (not memoized) for react-window
  const Cell = ({ columnIndex, rowIndex, style, ariaAttributes }: CellComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    const item = items[index];
    
    if (!item) return null;

    try {
      const rendered = renderItem(item, index);
      // Ensure we return a valid React element
      if (!rendered) {
        return null;
      }
      
      // Check if it's a valid React element using React's isValidElement
      if (isValidElement(rendered)) {
        return (
          <div
            {...ariaAttributes}
            style={{
              ...style,
              paddingLeft: columnIndex === 0 ? 0 : gap / 2,
              paddingRight: columnIndex === columnCount - 1 ? 0 : gap / 2,
              paddingTop: rowIndex === 0 ? 0 : gap / 2,
              paddingBottom: gap / 2,
            }}
            className={itemClassName}
          >
            {rendered}
          </div>
        );
      }
      
      // If it's a string or number, wrap it
      if (typeof rendered === 'string' || typeof rendered === 'number') {
        return (
          <div
            {...ariaAttributes}
            style={{
              ...style,
              paddingLeft: columnIndex === 0 ? 0 : gap / 2,
              paddingRight: columnIndex === columnCount - 1 ? 0 : gap / 2,
              paddingTop: rowIndex === 0 ? 0 : gap / 2,
              paddingBottom: gap / 2,
            }}
            className={itemClassName}
          >
            {rendered}
          </div>
        );
      }
      
      // If it's a component (function/class), log error and return null
      if (typeof rendered === 'function' || (typeof rendered === 'object' && rendered !== null && 'render' in rendered)) {
        console.error("VirtualizedGrid: renderItem returned a component instead of an element. Cell:", rowIndex, columnIndex, "Item:", item);
        return null;
      }
      
      return null;
    } catch (error) {
      console.error("Error rendering cell:", error);
      return null;
    }
  };

  const rowCount = Math.ceil(items.length / columnCount);
  // Calculate column width as percentage (100% / columnCount)
  const columnWidthPercent = 100 / columnCount;

  if (items.length === 0) {
    const EmptyIcon = emptyIcon;
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        {EmptyIcon && <EmptyIcon className="h-12 w-12 text-muted-foreground mb-4" />}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} style={{ gap: `${gap}px` }}>
      <Grid
        columnCount={columnCount}
        columnWidth={`${columnWidthPercent}%`}
        defaultHeight={height}
        rowCount={rowCount}
        rowHeight={itemHeight + gap}
        cellComponent={Cell}
        cellProps={{}}
        overscanCount={5}
      />
    </div>
  );
}
