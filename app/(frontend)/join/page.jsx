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

export default function JoinSpace() {
  const router = useRouter()
  const [spaceCode, setSpaceCode] = useState("")
  const [username, setUsername] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")

  const handleJoinSpace = async () => {
    if (!spaceCode || !username) return

    setIsJoining(true)
    setError("")

    try {
      // Connect to socket.io server
      const socket = io("/api/socket")

      // Try to join the space
      socket.emit("join-space", {
        code: spaceCode.toUpperCase(),
        username,
      })

      // Listen for confirmation or error
      socket.on("space-joined", (data) => {
        // Store space info in localStorage
        localStorage.setItem(
          "musicVoteSpace",
          JSON.stringify({
            name: data.name,
            code: data.code,
            isHost: false,
            username,
          }),
        )

        // Navigate to the space
        router.push(`/space/${data.code}`)
      })

      socket.on("join-error", (data) => {
        setError(data.message)
        setIsJoining(false)
      })
    } catch (error) {
      console.error("Failed to join space:", error)
      setError("Failed to connect to server")
      setIsJoining(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800 text-white">
        <CardHeader>
          <Link href="/" className="mb-2 flex items-center text-sm text-gray-400 hover:text-white">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to home
          </Link>
          <CardTitle className="text-2xl font-bold">Join a Space</CardTitle>
          <CardDescription className="text-gray-400">Enter a space code to join a stream</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="space-code">Space Code</Label>
            <Input
              id="space-code"
              placeholder="ABCDEF"
              value={spaceCode}
              onChange={(e) => setSpaceCode(e.target.value)}
              className="border-gray-700 bg-gray-900 text-white uppercase"
              maxLength={6}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Your Name</Label>
            <Input
              id="username"
              placeholder="Viewer123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-gray-700 bg-gray-900 text-white"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={handleJoinSpace}
            disabled={isJoining || !spaceCode || !username}
          >
            {isJoining ? "Joining..." : "Join Space"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
