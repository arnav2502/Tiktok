import { getSupabaseServer } from "./supabase/server"
import { signOutAction } from "./auth-actions"

export async function getCurrentUser() {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getCurrentUserProfile() {
  const supabase = await getSupabaseServer()
  const user = await getCurrentUser()

  if (!user) return null

  const { data, error } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

  if (error) {
    console.error("[v0] Error fetching user profile:", error)
    return null
  }

  return data
}

export async function signOut() {
  return await signOutAction()
}
