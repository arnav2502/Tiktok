"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getCurrentUserAction } from "@/lib/auth-actions"

interface VideoCardProps {
  video: {
    id: string
    title: string
    description: string
    video_url: string
    user_id: string
    view_count: number
    like_count: number
    comment_count: number
    users: {
      username: string
      display_name: string
      avatar_url: string | null
    }
  }
}

export function VideoCard({ video }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(video.like_count)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUserAction()
      setCurrentUser(user)

      if (user) {
        const supabase = getSupabaseClient()
        const { data } = await supabase
          .from("likes")
          .select("id")
          .eq("user_id", user.id)
          .eq("video_id", video.id)
          .maybeSingle()

        if (data) {
          setIsLiked(true)
        }
      }
    }

    fetchCurrentUser()
  }, [video.id])

  const handleLike = async () => {
    if (!currentUser) return

    const supabase = getSupabaseClient()

    if (isLiked) {
      await supabase.from("likes").delete().eq("user_id", currentUser.id).eq("video_id", video.id)

      setIsLiked(false)
      setLikeCount(Math.max(0, likeCount - 1))
    } else {
      await supabase.from("likes").insert({
        user_id: currentUser.id,
        video_id: video.id,
      })

      setIsLiked(true)
      setLikeCount(likeCount + 1)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="h-screen w-full snap-center flex items-center justify-center bg-black relative">
      {/* Video */}
      <div className="relative w-full max-w-md h-full flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={video.video_url}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Play Button Overlay */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition"
          >
            <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">▶</div>
          </button>
        )}

        {/* Video Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <Link href={`/profile/${video.users.username}`} className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold overflow-hidden">
              {video.users.avatar_url ? (
                <img
                  src={video.users.avatar_url || "/placeholder.svg"}
                  alt={video.users.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                video.users.display_name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-white font-semibold">{video.users.display_name}</p>
              <p className="text-gray-400 text-sm">@{video.users.username}</p>
            </div>
          </Link>

          <p className="text-white font-semibold mb-2">{video.title}</p>
          <p className="text-gray-300 text-sm">{video.description}</p>
        </div>

        {/* Right Sidebar Actions */}
        <div className="absolute right-6 bottom-20 flex flex-col gap-8">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex flex-col items-center gap-2 transition transform hover:scale-110 ${
              isLiked ? "text-red-500" : "text-gray-300 hover:text-white"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-xl transition">
              {isLiked ? "❤️" : "🤍"}
            </div>
            <span className="text-xs font-semibold text-white">{likeCount}</span>
          </button>

          {/* Comment Button */}
          <Link
            href={`/video/${video.id}/comments`}
            className="flex flex-col items-center gap-2 text-gray-300 hover:text-white transition transform hover:scale-110"
          >
            <div className="w-12 h-12 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-xl transition">
              💬
            </div>
            <span className="text-xs font-semibold text-white">{video.comment_count}</span>
          </Link>

          {/* Share Button */}
          <button className="flex flex-col items-center gap-2 text-gray-300 hover:text-white transition transform hover:scale-110">
            <div className="w-12 h-12 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-xl transition">
              🔗
            </div>
            <span className="text-xs font-semibold text-white">Share</span>
          </button>

          {/* Save Button */}
          <button className="flex flex-col items-center gap-2 text-gray-300 hover:text-white transition transform hover:scale-110">
            <div className="w-12 h-12 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-xl transition">
              🔖
            </div>
            <span className="text-xs font-semibold text-white">Save</span>
          </button>
        </div>
      </div>
    </div>
  )
}
