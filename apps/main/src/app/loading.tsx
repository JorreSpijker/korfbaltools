import { Spinner } from "@korfbaltools/ui";

export default function Loading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <Spinner />
    </main>
  );
}
