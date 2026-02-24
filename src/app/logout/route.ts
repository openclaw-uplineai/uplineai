import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  session.destroy();

  // Relative redirect: avoids needing NEXT_PUBLIC_BASE_URL.
  return NextResponse.redirect(new URL("/login", "http://localhost"));
}
