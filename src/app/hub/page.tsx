import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { CA_LIFE_STEPS } from "@/lib/licensingSteps";
import { updateStepStatus } from "./stepActions";

export default async function HubPage() {
  const userId = await requireUserId();

  const [profile, statuses] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.licensingStepStatus.findMany({ where: { userId } }),
  ]);

  const statusByKey = new Map(statuses.map((s) => [s.stepKey, s] as const));

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">California Life Licensing Hub</h1>
            <p className="text-sm text-neutral-600">Checklist + partner rules (no checkout in-app)</p>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link className="underline" href="/today">Today</Link>
            <Link className="underline" href="/crm/contacts">CRM</Link>
          </nav>
        </header>

        <section className="rounded border p-4 space-y-2">
          <div className="font-semibold">XCEL Partner Site</div>
          <div className="text-sm text-neutral-700">
            Users must be on the partner site / enter partner code <span className="font-mono">uplineai</span> BEFORE checkout.
            <div className="font-medium">Partner code is NOT a promo code (don’t use promo field).</div>
          </div>
          <div className="flex items-center gap-2">
            <a
              className="inline-block rounded bg-black px-3 py-2 text-white"
              href="https://partners.xcelsolutions.com/uplineai"
              target="_blank"
              rel="noreferrer"
            >
              Open partner site
            </a>
            <div className="text-sm text-neutral-600">
              Partner gate: {profile?.partnerGatePassedAt ? "passed" : "not confirmed"}
            </div>
            {!profile?.partnerGatePassedAt ? (
              <Link className="text-sm underline" href="/onboarding">
                confirm now
              </Link>
            ) : null}
          </div>
          <div className="text-sm text-neutral-600">After purchase, course access is in XCEL via “My Training”.</div>
        </section>

        <section className="rounded border p-4 space-y-3">
          <h2 className="font-semibold">Licensing checklist</h2>
          <ul className="space-y-2">
            {CA_LIFE_STEPS.map((step, idx) => {
              const st = statusByKey.get(step.key);
              const isDone = st?.status === "done";
              return (
                <li key={step.key} className="rounded border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-neutral-500">Step {idx + 1}</div>
                      <div className="font-medium">{step.title}</div>
                      {step.description ? (
                        <div className="text-sm text-neutral-600">{step.description}</div>
                      ) : null}
                    </div>

                    <form
                      action={async () => {
                        "use server";
                        await updateStepStatus({ stepKey: step.key, status: isDone ? "not_started" : "done" });
                      }}
                    >
                      <button
                        className={`rounded px-3 py-2 text-sm ${isDone ? "border" : "bg-black text-white"}`}
                        type="submit"
                      >
                        {isDone ? "Mark not done" : "Mark done"}
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
