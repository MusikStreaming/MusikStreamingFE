import Skeleton from "@/app/components/loading/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
    <Skeleton className="h-8 w-1/4 mb-4"></Skeleton>
    <Skeleton className="h-4 w-2/3 mb-8"></Skeleton>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Skeleton className="h-64"></Skeleton>
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4"></Skeleton>
        <Skeleton className="h-4 w-1/2"></Skeleton>
      </div>
    </div>
    </div>
    // <div className="container mx-auto px-4 py-8 animate-pulse">
    //       <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
    //       <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
    //       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    //         <div className="h-64 bg-gray-200 rounded"></div>
    //         <div className="space-y-4">
    //           <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    //           <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    //         </div>
    //   </div>
    // </div>
  )
}