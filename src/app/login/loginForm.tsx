"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { login } from "./loginAction";

export function LoginForm() {
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
          const res = await login(fd);
          if (!res.ok) {
            setError(res.error ?? "Login failed");
            return;
          }
          router.push("/today");
        });
      }}
    >
      <label className="space-y-1 block">
        <div className="text-sm">Email</div>
        <input name="email" type="email" className="w-full rounded border p-2" required />
      </label>

      <label className="space-y-1 block">
        <div className="text-sm">Password</div>
        <input name="password" type="password" className="w-full rounded border p-2" required />
      </label>

      {error ? <div className="rounded border border-red-300 bg-red-50 p-2 text-sm">{error}</div> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
