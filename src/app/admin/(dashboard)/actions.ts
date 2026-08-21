"use server";

import { redirect } from "next/navigation";

import { endOwnerSession } from "@/features/cms/session";

export async function signOut(): Promise<void> {
  await endOwnerSession();
  redirect("/admin/login");
}
