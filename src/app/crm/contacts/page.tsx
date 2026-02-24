import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";

export default async function ContactsPage() {
  const userId = await requireUserId();
  const contacts = await prisma.contact.findMany({
    where: { ownerUserId: userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Contacts</h1>
            <p className="text-sm text-neutral-600">CRM-lite (Sprint 1)</p>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link className="underline" href="/today">Today</Link>
            <Link className="underline" href="/hub">Licensing Hub</Link>
            <Link className="underline" href="/crm/tasks">Tasks</Link>
          </nav>
        </header>

        <section className="rounded border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your contacts</h2>
            <Link className="rounded bg-black px-3 py-2 text-white text-sm" href="/crm/contacts/new">
              Add contact
            </Link>
          </div>

          {contacts.length === 0 ? (
            <div className="text-sm text-neutral-600">No contacts yet.</div>
          ) : (
            <ul className="space-y-2">
              {contacts.map((c) => (
                <li key={c.id} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        <Link className="underline" href={`/crm/contacts/${c.id}`}>
                          {c.firstName} {c.lastName}
                        </Link>
                      </div>
                      <div className="text-sm text-neutral-600">
                        {c.email ?? "—"} • {c.phone ?? "—"} • {c.status}
                      </div>
                    </div>
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
