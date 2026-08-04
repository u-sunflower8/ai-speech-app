import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-8 text-lg font-semibold text-neutral-900">
        話し方診断AI
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
