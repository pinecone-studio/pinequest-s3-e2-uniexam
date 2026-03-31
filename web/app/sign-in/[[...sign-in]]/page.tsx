import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7fafc] px-6 py-12">
      <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
    </div>
  );
}
