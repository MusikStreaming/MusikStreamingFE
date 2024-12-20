import Skeleton from "@/app/components/loading/skeleton"

export default function AdminLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 border-b bg-gray-50/40 p-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>

        {/* Table Rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 border-b p-4">
            {[...Array(4)].map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}