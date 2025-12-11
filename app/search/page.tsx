"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"

interface SearchResult {
  type: "video" | "user"
  id: string
  title?: string
  display_name?: string
  username?: string
  view_count?: number
  follower_count?: number
  video_url?: string
  avatar_url?: string | null
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(query)

  useEffect(() => {
    async function performSearch() {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      const supabase = getSupabaseClient()

      // Search videos
      const { data: videos } = await supabase
        .from("videos")
        .select("id, title, video_url, view_count, users(username, display_name)")
        .ilike("title", `%${searchQuery}%`)
        .limit(10)

      // Search users
      const { data: users } = await supabase
        .from("users")
        .select("id, display_name, username, follower_count, avatar_url")
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .limit(10)

      const videoResults = (videos || []).map((v: any) => ({
        type: "video",
        id: v.id,
        title: v.title,
        view_count: v.view_count,
        video_url: v.video_url,
        display_name: v.users?.display_name,
        username: v.users?.username,
      }))

      const userResults = (users || []).map((u: any) => ({
        type: "user",
        id: u.id,
        display_name: u.display_name,
        username: u.username,
        follower_count: u.follower_count,
        avatar_url: u.avatar_url,
      }))

      setResults([...videoResults, ...userResults])
      setLoading(false)
    }

    performSearch()
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Search Box */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search videos and users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 text-lg py-3"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && <p className="text-gray-400">Searching...</p>}

          {!loading && results.length === 0 && searchQuery && (
            <p className="text-gray-400">No results found for "{searchQuery}"</p>
          )}

          {!loading &&
            results.map((result) => (
              <div key={`${result.type}-${result.id}`}>
                {result.type === "video" ? (
                  <Link
                    href={`/video/${result.id}`}
                    className="flex gap-4 bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition"
                  >
                    <video src={result.video_url} className="w-24 h-24 object-cover rounded flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-white font-semibold">{result.title}</p>
                      <p className="text-gray-400 text-sm">
                        by {result.display_name} (@{result.username})
                      </p>
                      <p className="text-gray-500 text-xs mt-2">{result.view_count?.toLocaleString()} views</p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href={`/profile/${result.username}`}
                    className="flex items-center gap-4 bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {result.avatar_url ? (
                        <img
                          src={result.avatar_url || "/placeholder.svg"}
                          alt={result.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        result.display_name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{result.display_name}</p>
                      <p className="text-gray-400 text-sm">@{result.username}</p>
                      <p className="text-gray-500 text-xs mt-2">{result.follower_count?.toLocaleString()} followers</p>
                    </div>
                  </Link>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
