"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { VideoCard } from "@/components/video-card"

interface Video {
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

export function Feed() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVideos() {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("videos")
        .select("*, users(username, display_name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("[v0] Error fetching videos:", error)
      } else {
        setVideos(data || [])
      }

      setLoading(false)
    }

    fetchVideos()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-lg">Loading videos...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto snap-y snap-mandatory">
      {videos.length === 0 ? (
        <div className="h-screen flex items-center justify-center text-white text-center">
          <div>
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-lg mb-4">No videos yet</p>
            <p className="text-gray-400">Be the first to upload!</p>
          </div>
        </div>
      ) : (
        videos.map((video) => <VideoCard key={video.id} video={video} />)
      )}
    </div>
  )
}
