"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"

interface Video {
  id: string
  title: string
  video_url: string
  view_count: number
  like_count: number
  users: {
    username: string
    display_name: string
  }
}

export function ExploreGrid() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVideos() {
      const supabase = getSupabaseClient()
      const { data } = await supabase
        .from("videos")
        .select("*, users(username, display_name)")
        .order("view_count", { ascending: false })
        .limit(30)

      setVideos(data || [])
      setLoading(false)
    }

    fetchVideos()
  }, [])

  if (loading) {
    return <div className="text-white text-center py-12">Loading videos...</div>
  }

  if (videos.length === 0) {
    return <div className="text-white text-center py-12">No videos yet</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/video/${video.id}`}
          className="group relative bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition"
        >
          <video src={video.video_url} className="w-full h-48 object-cover group-hover:opacity-80 transition" />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">▶</div>
          </div>
          <div className="p-3 bg-gray-800">
            <p className="text-white font-semibold text-sm truncate">{video.title}</p>
            <p className="text-gray-400 text-xs mt-1">{video.users.display_name}</p>
            <div className="flex gap-3 text-gray-400 text-xs mt-2">
              <span>❤️ {video.like_count}</span>
              <span>👁️ {video.view_count.toLocaleString()}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
