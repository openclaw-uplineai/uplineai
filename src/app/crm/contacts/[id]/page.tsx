import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { AddNoteForm } from "./ui/addNoteForm";
import { AddTaskForm } from "./ui/addTaskForm";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, ownerUserId: userId },
    include: {
      notes: { orderBy: { createdAt: "desc" }, take: 20 },
      tasks: { where: { status: "open" }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!contact) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-xl">
          <p>Contact not found.</p>
          <Link className="underline" href="/crm/contacts">Back</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {contact.firstName} {contact.lastName}
            </h1>
            <p className="text-sm text-neutral-600">
              {contact.email ?? "—"} • {contact.phone ?? "—"} • {contact.status}
            </p>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link className="underline" href="/crm/contacts">Contacts</Link>
            <Link className="underline" href="/crm/tasks">Tasks</Link>
          </nav>
        </header>

        <section className="rounded border p-4 space-y-3">
          <h2 className="font-semibold">Add note</h2>
          <AddNoteForm contactId={contact.id} />
        </section>

        <section className="rounded border p-4 space-y-3">
          <h2 className="font-semibold">Notes</h2>
          {contact.notes.length === 0 ? (
            <div className="text-sm text-neutral-600">No notes yet.</div>
          ) : (
            <ul className="space-y-2">
              {contact.notes.map((n) => (
                <li key={n.id} className="rounded border p-3">
                  <div className="text-xs text-neutral-500">{new Date(n.createdAt).toLocaleString()}</div>
                  <div className="text-sm whitespace-pre-wrap">{n.body}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded border p-4 space-y-3">
          <h2 className="font-semibold">Add task</h2>
          <AddTaskForm contactId={contact.id} />
        </section>

        <section className="rounded border p-4 space-y-3">
          <h2 className="font-semibold">Open tasks</h2>
          {contact.tasks.length === 0 ? (
            <div className="text-sm text-neutral-600">No open tasks for this contact.</div>
          ) : (
            <ul className="space-y-2">
              {contact.tasks.map((t) => (
                <li key={t.id} className="rounded border p-3">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-sm text-neutral-600">Priority {t.priority}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
