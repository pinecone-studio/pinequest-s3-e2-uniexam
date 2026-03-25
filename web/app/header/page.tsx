import { Button } from "@/components/ui/button";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

const Header = async () => {
  const user = await currentUser();
  const displayName =
    user?.fullName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "Account";

  return (
    <header className="border-b border-primary/10 bg-background">
      <div className="mx-14 flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4f39c3] text-white text-sm font-semibold">
            U
          </div>
          <span className="text-lg font-semibold text-[#4f39c3]">UniExam</span>
        </div>
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button>Sign Up</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <span className="max-w-40 text-sm font-semibold text-gray-700 truncate">
              {displayName}
            </span>
            <div className="relative flex items-center justify-center w-8 h-8">
              <ClerkLoading>
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse border border-gray-100" />
              </ClerkLoading>

              <ClerkLoaded>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-7 h-7",
                    },
                  }}
                />
              </ClerkLoaded>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
};

export default Header;
