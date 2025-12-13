/**
 * Virtualized List Component
 * Optimized for rendering large lists efficiently
 * Updated for react-window v2.2.3 API
 * 
 * CRITICAL: This component ensures renderItem always returns valid React elements
 * to prevent React error #31 (Objects are not valid as a React child)
 */

import { isValidElement, useMemo } from "react";
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
  // Memoize the Row component to prevent recreation on every render
  // This ensures react-window receives a stable component reference
  const Row = useMemo(() => {
    return ({ index, style }: RowComponentProps) => {
      const item = items[index];
      if (!item) return null;

      try {
        const rendered = renderItem(item, index);
        
        // Early return for null/undefined
        if (rendered == null) {
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
        
        // If it's a string or number, wrap it (valid React children)
        if (typeof rendered === 'string' || typeof rendered === 'number' || typeof rendered === 'boolean') {
          return (
            <div style={style} className={cn("px-2", itemClassName)}>
              {rendered}
            </div>
          );
        }
        
        // If it's a component (function/class), this is an error
        // Log it and return null to prevent React error #31
        if (typeof rendered === 'function' || (typeof rendered === 'object' && rendered !== null && ('render' in rendered || '$$typeof' in rendered))) {
          console.error(
            "VirtualizedList: renderItem returned a component/object instead of an element.",
            "Index:", index,
            "Type:", typeof rendered,
            "Item:", item
          );
          return null;
        }
        
        // For arrays, React can handle them, but we'll wrap for consistency
        if (Array.isArray(rendered)) {
          return (
            <div style={style} className={cn("px-2", itemClassName)}>
              {rendered}
            </div>
          );
        }
        
        // Fallback: log and return null
        console.warn("VirtualizedList: renderItem returned unexpected type:", typeof rendered, "Index:", index);
        return null;
      } catch (error) {
        console.error("VirtualizedList: Error rendering item at index", index, ":", error);
        return null;
      }
    };
  }, [items, renderItem, itemClassName]);

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
  // Memoize the Cell component to prevent recreation on every render
  // This ensures react-window receives a stable component reference
  const Cell = useMemo(() => {
    return ({ columnIndex, rowIndex, style, ariaAttributes }: CellComponentProps) => {
      const index = rowIndex * columnCount + columnIndex;
      const item = items[index];
      
      // Return empty div if no item (react-window requires a valid element)
      if (!item) {
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
          />
        );
      }

      try {
        const rendered = renderItem(item, index);
        
        // Early return for null/undefined
        if (rendered == null) {
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
        
        // If it's a string or number, wrap it (valid React children)
        if (typeof rendered === 'string' || typeof rendered === 'number' || typeof rendered === 'boolean') {
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
        
        // If it's a component (function/class), this is an error
        // Log it and return null to prevent React error #31
        if (typeof rendered === 'function' || (typeof rendered === 'object' && rendered !== null && ('render' in rendered || '$$typeof' in rendered))) {
          console.error(
            "VirtualizedGrid: renderItem returned a component/object instead of an element.",
            "Cell:", rowIndex, columnIndex,
            "Type:", typeof rendered,
            "Item:", item
          );
          return null;
        }
        
        // For arrays, React can handle them, but we'll wrap for consistency
        if (Array.isArray(rendered)) {
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
        
        // Fallback: log and return null
        console.warn("VirtualizedGrid: renderItem returned unexpected type:", typeof rendered, "Cell:", rowIndex, columnIndex);
        return null;
      } catch (error) {
        console.error("VirtualizedGrid: Error rendering cell at", rowIndex, columnIndex, ":", error);
        return null;
      }
    };
  }, [items, renderItem, itemClassName, columnCount, gap]);

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
