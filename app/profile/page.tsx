import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "@/lib/auth"
import { UserProfile } from "@/components/user-profile"

export default async function MyProfilePage() {
  const user = await getCurrentUserProfile()

  if (!user) {
    redirect("/auth/sign-in")
  }

  return <UserProfile isOwnProfile={true} username={user.username} userId={user.id} />
}
