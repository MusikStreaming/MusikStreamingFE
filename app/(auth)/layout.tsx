export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center justify-center w-full max-w-md p-4 rounded-md shadow-md">
        {children}
      </div>
    </div>
  );
}