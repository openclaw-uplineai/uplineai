"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addContactNote } from "./noteActions";

export function AddNoteForm({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await addContactNote({ contactId, body });
          if (!res.ok) {
            setError(res.error);
            return;
          }
          setBody("");
          router.refresh();
        });
      }}
    >
      <textarea
        className="w-full rounded border p-2"
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a note…"
      />
      {error ? <div className="rounded border border-red-300 bg-red-50 p-2 text-sm">{error}</div> : null}
      <button
        disabled={isPending || !body.trim()}
        className="rounded bg-black px-3 py-2 text-white text-sm disabled:opacity-50"
        type="submit"
      >
        {isPending ? "Saving…" : "Add note"}
      </button>
    </form>
  );
}
