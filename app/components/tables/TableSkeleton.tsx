import { Table, TableBody, TableCell, TableHeader, TableRow } from "./table";
import Skeleton from "@/app/components/loading/skeleton";

interface TableSkeletonProps {
  columns: number;
  rows: number;
}

export default function TableSkeleton({ columns, rows }: TableSkeletonProps) {
  return (
    <Table>
      <TableHeader className="bg-[--md-sys-color-surface-container]">
        <TableRow>
          {Array.from({ length: columns }).map((_, i) => (
            <TableCell key={i}>
              <Skeleton className="h-4 w-24" />
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-[--md-sys-color-surface]' : 'bg-[--md-sys-color-surface-container-highest]'}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
