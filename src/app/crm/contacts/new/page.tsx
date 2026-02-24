import Link from "next/link";

import { NewContactForm } from "./ui";

export default function NewContactPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">New contact</h1>
          <Link className="underline text-sm" href="/crm/contacts">
            Back
          </Link>
        </header>
        <NewContactForm />
      </div>
    </main>
  );
}
