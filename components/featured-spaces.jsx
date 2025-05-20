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

export default function CreateSpaceModal({ children }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [spaceName, setSpaceName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const generateSpaceId = () => {
    // Generate a 5-character alphanumeric ID
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleCreateSpace = async () => {
    if (!spaceName) return

    setIsCreating(true)

    try {
      // Generate a unique space ID
      const spaceId = generateSpaceId()

      // In a real app, you would save this to a database
      // For now, we'll just store it in localStorage
      localStorage.setItem(
        "musicVoteSpace",
        JSON.stringify({
          name: spaceName,
          id: spaceId,
          isHost: true,
          createdAt: new Date().toISOString(),
        }),
      )

      // Close the modal
      setOpen(false)

      // Navigate to the space
      router.push(`/space/${spaceId}`)
    } catch (error) {
      console.error("Failed to create space:", error)
      toast({
        title: "Error",
        description: "Failed to create space. Please try again.",
        variant: "destructive",
      })
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-gray-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create a Space</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new space for your audience to vote on songs
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
        </div>
        <DialogFooter>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={handleCreateSpace}
            disabled={isCreating || !spaceName}
          >
            {isCreating ? "Creating..." : "Create Space"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
