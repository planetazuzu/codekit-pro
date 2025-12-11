/**
 * Virtualized List Component
 * Optimized for rendering large lists efficiently
 * Updated for react-window v2.2.3 API
 */

import { memo } from "react";
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
  const Row = memo(({ index, style }: RowComponentProps) => {
    const item = items[index];
    if (!item) return null;

    return (
      <div style={style} className={cn("px-2", itemClassName)}>
        {renderItem(item, index)}
      </div>
    );
  });

  Row.displayName = "Row";

  if (items.length === 0) {
    const EmptyIcon = emptyIcon;
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        {EmptyIcon && <EmptyIcon className="h-12 w-12 text-muted-foreground mb-4" />}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const listProps: ListProps<unknown> = {
    rowCount: items.length,
    rowHeight: itemHeight,
    defaultHeight: height,
    overscanCount,
    rowComponent: Row,
    className: cn("w-full", className),
  };

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
  const Cell = memo(({ columnIndex, rowIndex, style, ariaAttributes }: CellComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    const item = items[index];
    
    if (!item) return null;

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
        {renderItem(item, index)}
      </div>
    );
  });

  Cell.displayName = "Cell";

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
