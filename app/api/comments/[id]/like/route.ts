import { getCurrentUserProfile } from "@/lib/auth"
import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const commentId = params.id
  const user = await getCurrentUserProfile()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await getSupabaseServer()

  const { error } = await supabase
    .from("comments")
    .update({ like_count: supabase.rpc("increment_like_count", { row_id: commentId }) })
    .eq("id", commentId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
