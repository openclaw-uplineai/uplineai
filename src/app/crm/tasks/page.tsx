import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { completeTask } from "./taskActions";

export default async function TasksPage() {
  const userId = await requireUserId();
  const tasks = await prisma.task.findMany({
    where: { ownerUserId: userId },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Tasks</h1>
            <p className="text-sm text-neutral-600">Open + completed</p>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link className="underline" href="/today">Today</Link>
            <Link className="underline" href="/hub">Licensing Hub</Link>
            <Link className="underline" href="/crm/contacts">Contacts</Link>
          </nav>
        </header>

        <section className="rounded border p-4 space-y-3">
          {tasks.length === 0 ? (
            <div className="text-sm text-neutral-600">No tasks yet.</div>
          ) : (
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="rounded border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{t.title}</div>
                      {t.description ? (
                        <div className="text-sm text-neutral-600 whitespace-pre-wrap">{t.description}</div>
                      ) : null}
                      <div className="text-xs text-neutral-500">
                        {t.status} • priority {t.priority}
                        {t.dueAt ? ` • due ${new Date(t.dueAt).toLocaleString()}` : ""}
                      </div>
                    </div>
                    {t.status === "open" ? (
                      <form
                        action={async () => {
                          "use server";
                          await completeTask({ taskId: t.id });
                        }}
                      >
                        <button className="rounded bg-black px-3 py-2 text-white text-sm" type="submit">
                          Mark done
                        </button>
                      </form>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
