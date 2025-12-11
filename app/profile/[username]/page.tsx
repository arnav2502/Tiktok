import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "@/lib/auth"
import { UserProfile } from "@/components/user-profile"

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const currentUser = await getCurrentUserProfile()

  if (!currentUser) {
    redirect("/auth/sign-in")
  }

  return (
    <UserProfile
      isOwnProfile={currentUser.username === params.username}
      username={params.username}
      userId={currentUser.id}
    />
  )
}
