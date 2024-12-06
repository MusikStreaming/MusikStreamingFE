import Skeleton from "@/app/components/loading/skeleton"
export default function Loading() {
  return (
    <div className="loading-screen w-full">
      {/* <h1 className="loading-text font-medium text-lg">
        Đang tải...
      </h1> */}
      <div className="home w-full flex flex-col gap-8">
        <div className="card-scroll flex flex-col overflow-hidden gap-4">
          <Skeleton className="w-full h-6" />
          <div className="flex gap-4">
            <Skeleton className="w-20 h-20" />
            <Skeleton className="w-20 h-20" />
            <Skeleton className="w-20 h-20" />
            <Skeleton className="w-20 h-20" />
          </div>
        </div>
        <div className="card-grid grid grid-flow-row">
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
                <Skeleton className="w-[140px] h-[200px]"/>
            </div>
      </div>
    </div>
  )
}