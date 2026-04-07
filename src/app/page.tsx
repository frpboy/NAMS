export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-teal-600">NAMS</h1>
        <p className="mt-2 text-muted-foreground">
          Nutrition Assessment Management System
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sahakar Smart Clinic
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Set up your Neon database credentials in <code className="rounded bg-muted px-1 py-0.5">.env</code> then run{" "}
          <code className="rounded bg-muted px-1 py-0.5">npm run db:push</code>
        </p>
      </div>
    </main>
  );
}
