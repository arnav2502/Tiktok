import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  return (
    <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
      <div className="p-8 text-center">
        <div className="mb-4 text-4xl">📧</div>
        <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
        <p className="text-gray-400 mb-6">
          We've sent you a confirmation link. Please check your email and click the link to verify your account.
        </p>

        <Link href="/auth/sign-in">
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Back to Sign In</Button>
        </Link>
      </div>
    </Card>
  )
}
