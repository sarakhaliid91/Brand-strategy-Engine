"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth, signOut } from "@/auth";
import { createClient, createProject } from "@/lib/db/queries";
import { LOCALE_COOKIE } from "@/lib/i18n";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user.id;
}

export async function createClientAction(formData: FormData) {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await createClient(userId, name);
  revalidatePath("/");
}

export async function createProjectAction(formData: FormData) {
  await requireUserId();
  const clientId = String(formData.get("clientId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const language = String(formData.get("language") ?? "ar") as "ar" | "en";
  if (!clientId || !name) return;

  const project = await createProject(clientId, name, language);
  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function setLanguageAction(locale: string) {
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale === "ar" ? "ar" : "en", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}
