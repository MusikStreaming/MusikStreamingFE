import Skeleton from "@/app/components/loading/skeleton"

export default function Loading() {
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2">
      <div className="flex flex-col">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-20 h-5" />
      </div>
      <div className="flex flex-col">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-20 h-5" />
      </div>
      <div className="flex flex-col">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-20 h-5" />
      </div>
      <div className="flex flex-col">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-20 h-5" />
      </div>
      <div className="flex flex-col">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-20 h-5" />
      </div>
    </div>
  </div>
}