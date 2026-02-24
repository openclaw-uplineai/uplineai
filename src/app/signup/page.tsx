import Link from "next/link";

import { SignupForm } from "./signupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <SignupForm />
        <p className="text-sm text-neutral-600">
          Already have an account? <Link href="/login" className="underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
