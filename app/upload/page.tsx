import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "@/lib/auth"
import { UploadForm } from "@/components/upload-form"

export default async function UploadPage() {
  const user = await getCurrentUserProfile()

  if (!user) {
    redirect("/auth/sign-in")
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Upload Video</h1>
        <UploadForm user={user} />
      </div>
    </div>
  )
}
