"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOutAction } from "@/lib/auth-actions"
import { useState } from "react"

export function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOutAction()
      router.push("/auth/sign-in")
    } catch (error) {
      console.error("[v0] Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")

  return (
    <nav className="w-16 md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col items-center md:items-start p-4 md:p-6 gap-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 text-white">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-lg font-bold">
          TT
        </div>
        <span className="hidden md:inline font-bold text-xl">TikTok Clone</span>
      </Link>

      {/* Navigation Links */}
      <div className="flex flex-col gap-4 flex-1 w-full">
        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            isActive("/") ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-xl">🏠</span>
          <span className="hidden md:inline">Home</span>
        </Link>

        <Link
          href="/explore"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            isActive("/explore") ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-xl">🔥</span>
          <span className="hidden md:inline">Explore</span>
        </Link>

        <Link
          href="/upload"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            isActive("/upload") ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-xl">➕</span>
          <span className="hidden md:inline">Upload</span>
        </Link>

        <Link
          href="/messages"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            isActive("/messages") ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-xl">💬</span>
          <span className="hidden md:inline">Messages</span>
        </Link>

        <Link
          href="/profile"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            isActive("/profile") ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <span className="text-xl">👤</span>
          <span className="hidden md:inline">Profile</span>
        </Link>
      </div>

      {/* Sign Out */}
      <Button
        onClick={handleSignOut}
        disabled={loading}
        variant="ghost"
        className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
      >
        <span className="text-xl">🚪</span>
        <span className="hidden md:inline ml-2">Logout</span>
      </Button>
    </nav>
  )
}
