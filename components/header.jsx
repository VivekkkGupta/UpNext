"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import SignInModal from "./sign-in-modal"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"
import { LogOut, User2, ListMusic } from "lucide-react" // Import Lucide icons
import { Music } from "lucide-react"

export default function Header() {
  const { isSignedIn, user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/")
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <header className="border-b border-gray-800 bg-gray-900 py-4 w-full">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex items-center">
            <Music className="h-8 w-8 text-purple-500 group-hover:rotate-12 transition-transform duration-200" />
            <span className="ml-2 text-2xl font-extrabold tracking-tight text-white">
              Up<span className="text-purple-400">Next</span>
            </span>
          </span>
        </Link>
        <div className="space-x-4 cursor-pointer">
          {!isLoaded ? null : isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none rounded-full border-2 border-purple-600">
                  <Image
                    width={36}
                    height={36}
                    src={user?.imageUrl}
                    alt={user?.fullName || "User"}
                    className="w-9 h-9 rounded-full object-cover cursor-pointer"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 text-white min-w-[180px]">
                <DropdownMenuItem
                  onClick={() => router.push("/myspaces")}
                  className="cursor-pointer hover:bg-gray-700"
                >
                  <ListMusic className="w-4 h-4 mr-2" />
                  My Spaces
                </DropdownMenuItem>
                {/* <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer hover:bg-gray-700"
                >
                  <User2 className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem> */}
                <DropdownMenuSeparator className="bg-gray-700" />
                <SignOutButton redirectUrl="/">
                  <DropdownMenuItem className="cursor-pointer text-red-400 hover:bg-gray-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </SignOutButton>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SignInModal>
              <Button variant="outline" className="text-white cursor-pointer">
                Login
              </Button>
            </SignInModal>
          )}
        </div>
      </div>
    </header>
  )
}