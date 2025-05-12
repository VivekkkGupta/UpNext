"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { io } from "socket.io-client"

export default function CreateSpace() {
  const router = useRouter()
  const [spaceName, setSpaceName] = useState("")
  const [streamerName, setStreamerName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateSpace = async () => {
    if (!spaceName || !streamerName) return

    setIsCreating(true)

    try {
      // Connect to socket.io server
      const socket = io("/api/socket")

      // Generate a unique space code (6 characters)
      const spaceCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      // Create the space on the server
      socket.emit("create-space", {
        name: spaceName,
        code: spaceCode,
        host: streamerName,
      })

      // Listen for confirmation
      socket.on("space-created", (data) => {
        // Store space info in localStorage
        localStorage.setItem(
          "musicVoteSpace",
          JSON.stringify({
            name: data.name,
            code: data.code,
            isHost: true,
            username: streamerName,
          }),
        )

        // Navigate to the space
        router.push(`/space/${data.code}`)
      })
    } catch (error) {
      console.error("Failed to create space:", error)
      setIsCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800 text-white">
        <CardHeader>
          <Link href="/" className="mb-2 flex items-center text-sm text-gray-400 hover:text-white">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to home
          </Link>
          <CardTitle className="text-2xl font-bold">Create a Space</CardTitle>
          <CardDescription className="text-gray-400">Set up a new voting space for your stream</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="space-name">Space Name</Label>
            <Input
              id="space-name"
              placeholder="My Awesome Stream"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="border-gray-700 bg-gray-900 text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="streamer-name">Your Name</Label>
            <Input
              id="streamer-name"
              placeholder="Streamer123"
              value={streamerName}
              onChange={(e) => setStreamerName(e.target.value)}
              className="border-gray-700 bg-gray-900 text-white"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={handleCreateSpace}
            disabled={isCreating || !spaceName || !streamerName}
          >
            {isCreating ? "Creating..." : "Create Space"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
