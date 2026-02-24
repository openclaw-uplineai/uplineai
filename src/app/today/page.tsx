import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { CA_LIFE_STEPS } from "@/lib/licensingSteps";

function stepTitle(stepKey?: string | null) {
  if (!stepKey) return "Start onboarding";
  return CA_LIFE_STEPS.find((s) => s.key === stepKey)?.title ?? stepKey;
}

export default async function TodayPage() {
  const userId = await requireUserId();

  const [profile, progress, stepStatuses, tasks] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.licensingProgress.findUnique({ where: { userId } }),
    prisma.licensingStepStatus.findMany({ where: { userId } }),
    prisma.task.findMany({
      where: { ownerUserId: userId, status: "open" },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 20,
    }),
  ]);

  const totalSteps = CA_LIFE_STEPS.length;
  const doneSteps = stepStatuses.filter((s) => s.status === "done").length;
  const percent = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const partnerGatePassed = !!profile?.partnerGatePassedAt;

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Today</h1>
            <p className="text-sm text-neutral-600">California Life — Sprint 1 MVP</p>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link className="underline" href="/hub">Licensing Hub</Link>
            <Link className="underline" href="/crm/contacts">CRM</Link>
            <Link className="underline" href="/onboarding">Onboarding</Link>
          </nav>
        </header>

        {!partnerGatePassed ? (
          <div className="rounded border border-amber-300 bg-amber-50 p-4">
            <div className="font-medium">Partner site step required</div>
            <div className="text-sm text-neutral-700">
              Before checkout on XCEL, users must be on the partner site and enter partner code.
              Partner code is not a promo code.
            </div>
            <Link href="/onboarding" className="mt-2 inline-block rounded bg-black px-3 py-2 text-white">
              Complete onboarding
            </Link>
          </div>
        ) : null}

        <section className="rounded border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Next step</h2>
            <div className="text-sm text-neutral-600">{percent}% complete</div>
          </div>
          <div className="text-lg">{stepTitle(progress?.nextStepKey)}</div>
          <div className="text-sm text-neutral-600">
            Your next step is based on the first licensing checklist item you haven’t marked done.
          </div>
          <Link className="inline-block rounded border px-3 py-2" href="/hub">
            Go to Licensing Hub
          </Link>
        </section>

        <section className="rounded border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Tasks (open)</h2>
            <Link className="underline text-sm" href="/crm/tasks">View all</Link>
          </div>
          {tasks.length === 0 ? (
            <div className="text-sm text-neutral-600">No open tasks yet.</div>
          ) : (
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="rounded border p-3">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-sm text-neutral-600">
                    {t.dueAt ? `Due ${new Date(t.dueAt).toLocaleString()}` : "No due date"} • Priority {t.priority}
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
