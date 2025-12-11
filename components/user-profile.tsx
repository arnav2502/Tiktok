"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client"

interface UserProfileData {
  id: string
  username: string
  display_name: string
  bio: string
  avatar_url: string | null
  follower_count: number
  following_count: number
  verified: boolean
}

interface UserProfileProps {
  isOwnProfile: boolean
  username: string
  userId: string
}

export function UserProfile({ isOwnProfile, username, userId }: UserProfileProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfileData() {
      const supabase = getSupabaseClient()

      // Fetch user profile
      const { data: profileData } = await supabase.from("users").select("*").eq("username", username).maybeSingle()

      if (!profileData) {
        router.push("/")
        return
      }

      setProfile(profileData)

      // Fetch user videos
      const { data: videosData } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false })

      setVideos(videosData || [])

      // Check if current user is following
      if (!isOwnProfile) {
        const { data: followData } = await supabase
          .from("followers")
          .select("id")
          .eq("follower_id", userId)
          .eq("following_id", profileData.id)
          .maybeSingle()

        if (followData) {
          setIsFollowing(true)
        }
      }

      setLoading(false)
    }

    fetchProfileData()
  }, [username, isOwnProfile, userId, router])

  const handleFollowToggle = async () => {
    if (!profile) return

    const supabase = getSupabaseClient()

    if (isFollowing) {
      // Unfollow
      await supabase.from("followers").delete().eq("follower_id", userId).eq("following_id", profile.id)

      setIsFollowing(false)
    } else {
      // Follow
      await supabase.from("followers").insert({
        follower_id: userId,
        following_id: profile.id,
      })

      setIsFollowing(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">User not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-4xl font-bold flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt={profile.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                profile.display_name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                {profile.verified && <span className="text-blue-500">✓</span>}
              </div>

              <p className="text-gray-400 mb-4">@{profile.username}</p>

              {profile.bio && <p className="text-white mb-6">{profile.bio}</p>}

              {/* Stats */}
              <div className="flex gap-8 mb-6">
                <div>
                  <p className="text-2xl font-bold text-white">{videos.length}</p>
                  <p className="text-gray-400 text-sm">Videos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{profile.follower_count}</p>
                  <p className="text-gray-400 text-sm">Followers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{profile.following_count}</p>
                  <p className="text-gray-400 text-sm">Following</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {isOwnProfile ? (
                  <>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">Edit Profile</Button>
                    <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800 bg-transparent">
                      Share
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleFollowToggle}
                      className={`${isFollowing ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"} text-white`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800 bg-transparent">
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Videos</h2>

          {videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No videos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/video/${video.id}`}
                  className="group relative bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition"
                >
                  <video src={video.video_url} className="w-full h-40 object-cover group-hover:opacity-80 transition" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">▶</div>
                  </div>
                  <div className="p-3 bg-gray-800">
                    <p className="text-white font-semibold text-sm truncate">{video.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{video.view_count.toLocaleString()} views</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
