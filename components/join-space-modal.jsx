"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function JoinSpaceModal({ children }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [spaceId, setSpaceId] = useState("")
  const [username, setUsername] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const handleJoinSpace = async () => {
    if (!spaceId || !username) return

    setIsJoining(true)

    try {
      // In a real app, you would validate this against a database
      // For now, we'll just store it in localStorage
      localStorage.setItem(
        "musicVoteSpace",
        JSON.stringify({
          id: spaceId.toUpperCase(),
          username,
          isHost: false,
          joinedAt: new Date().toISOString(),
        }),
      )

      // Close the modal
      setOpen(false)

      // Navigate to the space
      router.push(`/space/${spaceId.toUpperCase()}`)
    } catch (error) {
      console.error("Failed to join space:", error)
      toast({
        title: "Error",
        description: "Failed to join space. Please check the space ID and try again.",
        variant: "destructive",
      })
      setIsJoining(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-gray-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Join a Space</DialogTitle>
          <DialogDescription className="text-gray-400">Enter a space ID to join and vote on songs</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="space-id">Space ID</Label>
            <Input
              id="space-id"
              placeholder="ABCD1"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              className="border-gray-700 bg-gray-900 text-white uppercase"
              maxLength={5}
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
        </div>
        <DialogFooter>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={handleJoinSpace}
            disabled={isJoining || !spaceId || !username}
          >
            {isJoining ? "Joining..." : "Join Space"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
