"use client"

import Link from "next/link"
import { Music } from "lucide-react"

export default function Header() {

  return (
    <header className="border-b border-gray-800 bg-gray-900 py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Music className="mr-2 h-6 w-6 text-purple-500" />
          <span className="text-xl font-bold text-white">MusicVoter</span>
        </Link>

        <div>
          
        </div>
      </div>
    </header>
  )
}
