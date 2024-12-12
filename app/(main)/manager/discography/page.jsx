'use client';

import "@material/web/fab/fab";
import { useRouter } from "next/navigation";

export default function DiscographyPage() {
  const router = useRouter();
  const handleFabClick = () => {
    router.push('/new-page'); // replace '/new-page' with the desired route
  };
  return (
    <div className="h-full relative">
      <div className="w-full h-full">
        <h1 className="text-2xl font-bold">Discography</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Albums</h2>
          </div>
          <div className="flex flex-col gap-4">
          </div>
        </div>
      </div>
      <button
        className="absolute bottom-4 right-4 p-0 w-16 h-16 bg-blue-500 rounded-full text-white text-3xl flex items-center justify-center"
        onClick={handleFabClick}
      >
        +
      </button>
    </div>
  );
}
