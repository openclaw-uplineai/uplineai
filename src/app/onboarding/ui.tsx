"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { Profile, Tier } from "@prisma/client";
import { saveOnboarding, submitTierRequest } from "./actions";

function tierLabel(tier: Tier) {
  switch (tier) {
    case "DIY_FREE":
      return "Tier 1 — DIY (Free access)";
    case "CONCIERGE_200_PLUS_FEES":
      return "Tier 2 — Concierge DFY ($200 + state fees)";
    case "INNER_CIRCLE_1500_INCL_FEES":
      return "Tier 3 — Inner Circle ($1,500 includes state fees)";
  }
}

export function OnboardingForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tier, setTier] = useState<Tier>(profile.tier);
  const [partnerCode, setPartnerCode] = useState(profile.partnerCodeEntered ?? "");
  const [partnerAck, setPartnerAck] = useState(profile.partnerSiteAck);

  const [requestingTier, setRequestingTier] = useState<Exclude<Tier, "DIY_FREE"> | null>(null);
  const [requestPhone, setRequestPhone] = useState(profile.userId ? "" : "");
  const [requestBestTime, setRequestBestTime] = useState("");
  const [requestNotes, setRequestNotes] = useState("");

  const [error, setError] = useState<string | null>(null);

  const isUpgradeTier = useMemo(() => tier !== "DIY_FREE", [tier]);

  return (
    <div className="space-y-6">
      <section className="rounded border p-4 space-y-3">
        <h2 className="font-semibold">1) Choose your tier</h2>
        <div className="grid gap-2">
          {([
            "DIY_FREE",
            "CONCIERGE_200_PLUS_FEES",
            "INNER_CIRCLE_1500_INCL_FEES",
          ] as Tier[]).map((t) => (
            <label key={t} className="flex items-start gap-3 rounded border p-3">
              <input
                type="radio"
                name="tier"
                checked={tier === t}
                onChange={() => setTier(t)}
                className="mt-1"
              />
              <div>
                <div className="font-medium">{tierLabel(t)}</div>
                {t === "DIY_FREE" ? (
                  <div className="text-sm text-neutral-600">
                    Free platform access. You pay all CA required state fees yourself.
                  </div>
                ) : t === "CONCIERGE_200_PLUS_FEES" ? (
                  <div className="text-sm text-neutral-600">
                    Request Concierge. We invoice manually / send a Stripe payment link.
                  </div>
                ) : (
                  <div className="text-sm text-neutral-600">
                    Request Inner Circle. We invoice manually / send a Stripe payment link.
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>

        {isUpgradeTier ? (
          <div className="rounded border bg-neutral-50 p-3 text-sm">
            <div className="font-medium">Sprint 1 note</div>
            <div className="text-neutral-700">
              Tier 2 and Tier 3 do not have in-app checkout yet. You’ll submit a request and we’ll
              contact you within 24–48 hours.
            </div>
            <button
              type="button"
              className="mt-2 rounded bg-black px-3 py-2 text-white"
              onClick={() => {
                if (tier === "DIY_FREE") return;
                setRequestingTier(tier);
              }}
            >
              {tier === "CONCIERGE_200_PLUS_FEES" ? "Request Concierge" : "Request Inner Circle"}
            </button>
          </div>
        ) : null}
      </section>

      <section className="rounded border p-4 space-y-3">
        <h2 className="font-semibold">2) XCEL Partner Access (required)</h2>
        <div className="text-sm text-neutral-700 space-y-1">
          <div>
            Users must be on the partner site / enter partner code <span className="font-mono">uplineai</span>
            BEFORE checkout.
          </div>
          <div className="font-medium">Partner code is NOT a promo code (don’t use promo field).</div>
        </div>

        <a
          className="inline-block rounded border px-3 py-2"
          href="https://partners.xcelsolutions.com/uplineai"
          target="_blank"
          rel="noreferrer"
        >
          Open XCEL Partner Site
        </a>

        <label className="block space-y-1">
          <div className="text-sm">Enter partner code (must be uplineai)</div>
          <input
            className="w-full rounded border p-2 font-mono"
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value)}
            placeholder="uplineai"
          />
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={partnerAck} onChange={(e) => setPartnerAck(e.target.checked)} />
          <span>I understand I must use the partner site and enter partner code before checkout.</span>
        </label>
      </section>

      {error ? <div className="rounded border border-red-300 bg-red-50 p-3 text-sm">{error}</div> : null}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await saveOnboarding({ tier, partnerCodeEntered: partnerCode, partnerSiteAck: partnerAck });
              if (!res.ok) {
                setError(res.error);
                return;
              }
              router.push("/today");
            });
          }}
        >
          {isPending ? "Saving…" : "Save & continue"}
        </button>
        <button type="button" className="rounded border px-4 py-2" onClick={() => router.push("/today")}>
          Skip for now
        </button>
      </div>

      {requestingTier ? (
        <div className="fixed inset-0 bg-black/30 p-6">
          <div className="mx-auto max-w-lg rounded bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{requestingTier === "CONCIERGE_200_PLUS_FEES" ? "Request Concierge" : "Request Inner Circle"}</h3>
              <button className="text-sm underline" onClick={() => setRequestingTier(null)}>
                Close
              </button>
            </div>

            <label className="block space-y-1">
              <div className="text-sm">Phone</div>
              <input className="w-full rounded border p-2" value={requestPhone} onChange={(e) => setRequestPhone(e.target.value)} placeholder="(555) 555-5555" />
            </label>

            <label className="block space-y-1">
              <div className="text-sm">Best time to reach you</div>
              <input className="w-full rounded border p-2" value={requestBestTime} onChange={(e) => setRequestBestTime(e.target.value)} placeholder="Weekdays after 5pm" />
            </label>

            <label className="block space-y-1">
              <div className="text-sm">Notes</div>
              <textarea className="w-full rounded border p-2" rows={4} value={requestNotes} onChange={(e) => setRequestNotes(e.target.value)} placeholder="Anything we should know?" />
            </label>

            <button
              className="w-full rounded bg-black px-4 py-2 text-white"
              onClick={() => {
                startTransition(async () => {
                  const res = await submitTierRequest({ requestedTier: requestingTier, phone: requestPhone, bestTime: requestBestTime, notes: requestNotes });
                  if (!res.ok) {
                    setError(res.error);
                    return;
                  }
                  setRequestingTier(null);
                  alert("Request submitted. We’ll contact you within 24–48 hours.");
                });
              }}
            >
              Submit request
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
