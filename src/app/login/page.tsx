import Link from "next/link";

import { LoginForm } from "./loginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <LoginForm />
        <p className="text-sm text-neutral-600">
          New here? <Link href="/signup" className="underline">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
