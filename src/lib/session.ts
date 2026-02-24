import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";

export type SessionData = {
  userId?: string;
};

const sessionOptions = {
  cookieName: "uplineai_session",
  password:
    process.env.SESSION_PASSWORD ??
    // dev fallback only; set SESSION_PASSWORD on Vercel
    "dev_password_please_change_dev_password_please_change",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
} as const;

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
