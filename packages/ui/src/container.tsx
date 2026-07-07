export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full flex max-w-4xl flex-col items-start gap-4 px-6 py-20">
      {children}
    </div>
  );
}
