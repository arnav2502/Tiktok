import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "@/lib/auth"

export default async function MessagesPage() {
  const user = await getCurrentUserProfile()

  if (!user) {
    redirect("/auth/sign-in")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <p className="text-gray-400">Messages feature coming soon!</p>
        </div>
      </div>
    </div>
  )
}
