"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { signup } from "./signupAction";

export function SignupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await signup(fd);
          if (!res.ok) {
            setError(res.error ?? "Signup failed");
            return;
          }
          router.push("/onboarding");
        });
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <div className="text-sm">First name</div>
          <input name="firstName" className="w-full rounded border p-2" required />
        </label>
        <label className="space-y-1">
          <div className="text-sm">Last name</div>
          <input name="lastName" className="w-full rounded border p-2" required />
        </label>
      </div>

      <label className="space-y-1 block">
        <div className="text-sm">Email</div>
        <input name="email" type="email" className="w-full rounded border p-2" required />
      </label>

      <label className="space-y-1 block">
        <div className="text-sm">Password</div>
        <input
          name="password"
          type="password"
          className="w-full rounded border p-2"
          minLength={8}
          required
        />
        <div className="text-xs text-neutral-500">Minimum 8 characters.</div>
      </label>

      {error ? <div className="rounded border border-red-300 bg-red-50 p-2 text-sm">{error}</div> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
