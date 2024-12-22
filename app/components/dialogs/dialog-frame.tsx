export default function DialogFrame(
  { children }: { children: React.ReactNode }
) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[--md-sys-color-surface] p-6 rounded-md w-96 h-3/4 max-h-fit overflow-auto flex flex-col gap-4 justify-center">
        {children}
      </div>
    </div>
  );
}