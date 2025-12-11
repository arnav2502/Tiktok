"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client"

interface Comment {
  id: string
  content: string
  user_id: string
  created_at: string
  like_count: number
  users: {
    username: string
    display_name: string
    avatar_url: string | null
  }
}

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  users: {
    username: string
    display_name: string
  }
}

export default function CommentsPage() {
  const params = useParams()
  const videoId = params.id as string

  const [video, setVideo] = useState<Video | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = getSupabaseClient()

      // Get current user from Supabase auth client instead
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

        setCurrentUser(userData)
      }

      // Fetch video
      const { data: videoData } = await supabase
        .from("videos")
        .select("*, users(username, display_name)")
        .eq("id", videoId)
        .single()

      if (videoData) {
        setVideo(videoData)
      }

      // Fetch comments
      const { data: commentsData } = await supabase
        .from("comments")
        .select("*, users(username, display_name, avatar_url)")
        .eq("video_id", videoId)
        .order("created_at", { ascending: false })

      setComments(commentsData || [])
      setLoading(false)
    }

    fetchData()
  }, [videoId])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    setSubmitting(true)
    const supabase = getSupabaseClient()

    try {
      const { data } = await supabase
        .from("comments")
        .insert({
          video_id: videoId,
          user_id: currentUser.id,
          content: newComment.trim(),
        })
        .select("*, users(username, display_name, avatar_url)")
        .single()

      if (data) {
        setComments([data, ...comments])
        setNewComment("")
      }
    } catch (error) {
      console.error("[v0] Error submitting comment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-4">
        {/* Video Preview */}
        {video && (
          <div className="mb-8 bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex gap-4 p-4">
              <video src={video.video_url} className="w-24 h-32 object-cover rounded" />
              <div className="flex-1">
                <Link href={`/profile/${video.users.username}`} className="hover:underline">
                  <p className="font-semibold text-white">{video.title}</p>
                  <p className="text-gray-400 text-sm">by {video.users.display_name}</p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Comment Form */}
        {currentUser && (
          <form onSubmit={handleSubmitComment} className="mb-8 bg-gray-900 p-4 rounded-lg">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                {currentUser.display_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-red-500"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                    onClick={() => setNewComment("")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {submitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 bg-gray-900 p-4 rounded-lg">
                <Link href={`/profile/${comment.users.username}`}>
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold flex-shrink-0 cursor-pointer hover:bg-red-700">
                    {comment.users.avatar_url ? (
                      <img
                        src={comment.users.avatar_url || "/placeholder.svg"}
                        alt={comment.users.display_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      comment.users.display_name.charAt(0).toUpperCase()
                    )}
                  </div>
                </Link>

                <div className="flex-1">
                  <Link href={`/profile/${comment.users.username}`} className="hover:underline">
                    <p className="font-semibold text-white">{comment.users.display_name}</p>
                    <p className="text-gray-500 text-xs">@{comment.users.username}</p>
                  </Link>
                  <p className="text-gray-200 mt-2 text-sm">{comment.content}</p>

                  <div className="flex gap-4 mt-2 text-gray-400 text-xs">
                    <button className="hover:text-white">❤️ {comment.like_count}</button>
                    <button className="hover:text-white">Reply</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
