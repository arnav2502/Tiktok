"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase/client"
import { saveVideoAction } from "@/lib/auth-actions"

interface UploadFormProps {
  user: {
    id: string
    username: string
    display_name: string
  }
}

export function UploadForm({ user }: UploadFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith("video/")) {
        setError("Please select a video file")
        return
      }
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("Video file must be less than 100MB")
        return
      }
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setPreview(url)
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) {
      setError("Please select a video and enter a title")
      return
    }

    setLoading(true)
    setError("")
    try {
      const supabase = getSupabaseClient()

      console.log("[v0] Starting video upload for:", title)

      const videoFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`
      console.log("[v0] Uploading to bucket with filename:", videoFileName)

      const { error: uploadError, data } = await supabase.storage.from("videos").upload(videoFileName, file)

      if (uploadError) {
        console.log("[v0] Upload error:", uploadError.message)
        if (uploadError.message.includes("Bucket not found")) {
          setError("Storage not initialized yet. Please refresh the page and try again.")
        } else {
          setError(`Failed to upload video: ${uploadError.message || "Unknown error"}`)
        }
        setLoading(false)
        return
      }

      console.log("[v0] Upload successful, getting public URL")

      // Get public URL
      const { data: publicData } = supabase.storage.from("videos").getPublicUrl(videoFileName)
      const videoUrl = publicData.publicUrl
      console.log("[v0] Public URL:", videoUrl)

      const video = document.createElement("video")
      video.src = preview

      const duration = await new Promise<number>((resolve) => {
        const onLoadedMetadata = () => {
          const dur = Math.round(video.duration)
          console.log("[v0] Video duration:", dur)
          video.removeEventListener("loadedmetadata", onLoadedMetadata)
          resolve(dur)
        }
        video.addEventListener("loadedmetadata", onLoadedMetadata)
      })

      console.log("[v0] Saving video metadata to database using Server Action")

      await saveVideoAction(user.id, title.trim(), description.trim(), videoUrl, duration)

      console.log("[v0] Video uploaded successfully, redirecting")
      router.push(`/profile/${user.username}`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred"
      console.log("[v0] Upload error:", errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Preview */}
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-red-500 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <video src={preview} className="w-full max-h-64 object-cover rounded" controls />
            ) : (
              <div className="py-12">
                <div className="text-4xl mb-4">📹</div>
                <p className="text-gray-300 font-medium">Click or drag video here</p>
                <p className="text-gray-500 text-sm mt-2">MP4, up to 100MB</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Video Title</label>
            <Input
              type="text"
              placeholder="Give your video a catchy title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              maxLength={100}
            />
            <p className="text-gray-500 text-xs mt-1">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              placeholder="Tell viewers about your video"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder:text-gray-500 rounded p-2"
              maxLength={500}
              rows={4}
            />
            <p className="text-gray-500 text-xs mt-1">{description.length}/500</p>
          </div>

          {/* Error */}
          {error && <div className="bg-red-900/30 border border-red-700 rounded p-3 text-sm text-red-200">{error}</div>}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2"
          >
            {loading ? "Uploading..." : "Upload Video"}
          </Button>
        </form>
      </div>
    </Card>
  )
}
