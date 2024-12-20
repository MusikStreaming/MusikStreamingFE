interface ResultMobileProps {
  query: string;
}

export default function ResultMobile({ query }: ResultMobileProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Search results for &quot;{query}&quot;</h2>
      {/* Add your search results content here */}
    </div>
  );
}