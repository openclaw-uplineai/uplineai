import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { OnboardingForm } from "./ui";

export default async function OnboardingPage() {
  const userId = await requireUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user?.profile) {
    // Should not happen; created on signup.
    throw new Error("Profile missing");
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">California Life onboarding</h1>
          <p className="text-sm text-neutral-600">
            Sprint 1 is California-only and California Life-only.
          </p>
        </header>

        <OnboardingForm profile={user.profile} />
      </div>
    </main>
  );
}
