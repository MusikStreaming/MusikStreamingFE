interface ResultDesktopProps {
  query: string;
}

export default function ResultDesktop({ query }: ResultDesktopProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Search results for &quot;{query}&quot;</h2>
    </div>
  );
}