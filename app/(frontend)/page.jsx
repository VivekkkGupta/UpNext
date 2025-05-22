'use client'
import { Button } from "@/components/ui/button"
import TopViewedSpaces from "@/components/top-viewed-spaces"
import MyActiveSpaces from "@/components/my-active-spaces"
import CreateSpaceModal from "@/components/create-space-modal"
import JoinSpaceModal from "@/components/join-space-modal"
import SignInModal from "@/components/sign-in-modal"
import { useUser } from "@clerk/nextjs"

export default function Home() {

  const { isSignedIn, userId } = useUser()

  return (
    <div className="max-w-[1240px] mx-auto">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 flex flex-col items-center justify-center space-y-6 pt-10 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">Stream Music Voter</h1>
          <p className="max-w-2xl text-lg text-gray-400">
            Let your audience vote for the next song to play on your stream
          </p>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            {isSignedIn ? (
              <CreateSpaceModal>
                <Button
                  variant="outline"
                  className="w-full bg-purple-600 text-white hover:bg-purple-700 sm:w-auto"
                  size="lg"
                >
                  Create Space
                </Button>
              </CreateSpaceModal>
            ) : (
              <SignInModal>
                <Button
                  variant="outline"
                  className="w-full bg-purple-600 text-white hover:bg-purple-700 sm:w-auto"
                  size="lg"
                >
                  Create Space Now!
                </Button>
              </SignInModal>
            )}

            {isSignedIn ? (
              <JoinSpaceModal>
                <Button
                  variant="outline"
                  className="w-full border-purple-600 text-purple-400 hover:bg-gray-800 hover:text-purple-300 sm:w-auto"
                  size="lg"
                >
                  Join Space
                </Button>
              </JoinSpaceModal>
            ) : (
              <SignInModal>
                <Button
                  variant="outline"
                  className="w-full border-purple-600 text-purple-400 hover:bg-gray-800 hover:text-purple-300 sm:w-auto"
                  size="lg"
                >
                  Join Space
                </Button>
              </SignInModal>
            )}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <MyActiveSpaces />
          <TopViewedSpaces />
        </div>
      </main>
    </div>
  )
}
