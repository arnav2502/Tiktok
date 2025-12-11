"use server"

import { getSupabaseServer } from "./supabase/server"
import { createClient } from "@supabase/supabase-js"
import { getCurrentUser } from "./auth"

export async function signUpAction(email: string, password: string, username: string, displayName: string) {
  const supabase = await getSupabaseServer()

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  })

  if (authError) throw authError
  if (!authData.user) throw new Error("User creation failed")

  const serviceSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Create user profile
  const { error: profileError } = await serviceSupabase.from("users").insert({
    id: authData.user.id,
    username,
    display_name: displayName,
  })

  if (profileError) throw profileError

  return { success: true, message: "Check your email to verify your account" }
}

export async function signInAction(email: string, password: string) {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  return { success: true, user: data.user }
}

export async function signOutAction() {
  const supabase = await getSupabaseServer()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  return { success: true }
}

export async function getCurrentUserAction() {
  try {
    const supabase = await getSupabaseServer()
    const user = await getCurrentUser()

    if (!user) return null

    const { data, error } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

    if (error) {
      console.error("[v0] Error fetching user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] Error in getCurrentUserAction:", error)
    return null
  }
}

export async function initializeStorageBucketAction() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { error: createError } = await supabase.storage.createBucket("videos", {
      public: true,
    })

    if (createError) {
      if (
        createError.status === 409 ||
        createError.statusCode === 409 ||
        createError.message?.includes("already exists")
      ) {
        console.log("[v0] Storage bucket already exists - proceeding with upload")
        return { success: true }
      }
      throw createError
    }

    console.log("[v0] Storage bucket created successfully")
    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    throw new Error(`Failed to initialize storage: ${errorMsg}`)
  }
}

export async function saveVideoAction(
  userId: string,
  title: string,
  description: string,
  videoUrl: string,
  duration: number,
) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/insert_video_no_rls`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        p_user_id: userId,
        p_title: title,
        p_description: description,
        p_video_url: videoUrl,
        p_duration: duration,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Save video error response:", errorText)
      throw new Error(`Failed to save video: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log("[v0] Video metadata saved successfully:", result)
    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Save video error:", errorMsg)
    throw new Error(`Failed to save video: ${errorMsg}`)
  }
}
