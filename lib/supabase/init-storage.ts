import { getSupabaseServer } from "./server"

let bucketInitialized = false

export async function initializeStorageBucket() {
  // If already initialized in this session, skip
  if (bucketInitialized) return

  try {
    const supabase = await getSupabaseServer()

    // Don't try to list buckets as that requires additional permissions
    const { error: createError } = await supabase.storage.createBucket("videos", {
      public: true,
    })

    // If error is "already exists", that's fine - bucket is already there
    if (createError && !createError.message?.includes("already exists")) {
      console.error("[v0] Error with videos bucket:", createError)
      return
    }

    bucketInitialized = true
    console.log("[v0] Videos storage bucket ready")
  } catch (error) {
    console.error("[v0] Failed to initialize storage:", error)
  }
}
