import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "@/lib/auth"
import { Feed } from "@/components/feed"
import { Navigation } from "@/components/navigation"

export default async function HomePage() {
  const user = await getCurrentUserProfile()

  if (!user) {
    redirect("/auth/sign-in")
  }

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <Navigation />
      <Feed />
    </div>
  )
}
