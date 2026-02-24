"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addContactTask } from "./taskActions";

export function AddTaskForm({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await addContactTask({ contactId, title });
          if (!res.ok) {
            setError(res.error);
            return;
          }
          setTitle("");
          router.refresh();
        });
      }}
    >
      <input
        className="w-full rounded border p-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title…"
      />
      {error ? <div className="rounded border border-red-300 bg-red-50 p-2 text-sm">{error}</div> : null}
      <button
        disabled={isPending || !title.trim()}
        className="rounded bg-black px-3 py-2 text-white text-sm disabled:opacity-50"
        type="submit"
      >
        {isPending ? "Saving…" : "Add task"}
      </button>
    </form>
  );
}
