import Skeleton from "@/app/components/loading/skeleton"

export default function Loading(
  props : {
    className?: string,
    children?: React.ReactNode
  }
) {
  return (
    <div className='loading-screen flex w-full'>
        <div className="flex flex-col items-center w-full gap-12">
          <div className='flex items-center w-full gap-4'>
              <Skeleton className="w-[200px] h-[200px]" />
            <div className="flex flex-col">
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-12 w-full rounded-full' />
            </div>
          </div>
          <div className="w-full">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">Title</th>
                  <th className="text-left">Durations</th>
                  <th className="text-left">Play</th>
                </tr>
              </thead>
              <tbody>
                <tr className="p-3">
                  <td>1</td>
                  
                    <td className="py-3">
                      {
                        <Skeleton className='h-4 w-full' />
                      }
                    </td>
                  <td className="py-3">
                    {
                      <Skeleton className='h-4 w-full' />
                    }
                  </td>
                  <td className="py-3">
                    {
                      <Skeleton className='h-4 w-full' />
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-start w-full">
            {
              <Skeleton className='h-4 w-full' />
            }
            <p><Skeleton className="w-5"/></p>
          </div>
        </div>

      </div>
  )
}