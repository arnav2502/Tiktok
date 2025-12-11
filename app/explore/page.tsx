import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "@/lib/auth"
import { ExploreGrid } from "@/components/explore-grid"

export default async function ExplorePage() {
  const user = await getCurrentUserProfile()

  if (!user) {
    redirect("/auth/sign-in")
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Explore</h1>
        <ExploreGrid />
      </div>
    </div>
  )
}
