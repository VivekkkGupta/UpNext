"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {

  return (
    <header className=" border-b border-gray-800 bg-gray-900 py-4 w-full">
      <div className=" max-w-[1240px] mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          {/* <Music className="mr-2 h-6 w-6 text-purple-500" /> */}
          <span className="text-xl font-bold text-white">UpNext</span>
        </Link>
        <div className="space-x-4">
          <Button variant="outline" className="text-white cursor-pointer">
            Login
          </Button>
          <Button variant="ghost" className="text-white cursor-pointer">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  )
}
