import { notFound } from "next/navigation";

// Rewrite-doel van de middleware voor uitgeschakelde apps: levert een echte
// 404 in plaats van een lege respons vanuit de edge runtime.
export default function NietBeschikbaarPage() {
  notFound();
}
