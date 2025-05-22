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
import axios from "axios"
import { useUser } from "@clerk/nextjs"
import { useAppContext } from "@/contexts/AppContext"

export default function CreateSpaceModal({ children }) {
  const router = useRouter()
  const { fetchSpaces } = useAppContext()
  const [open, setOpen] = useState(false)
  const [spaceName, setSpaceName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { user: clerkId } = useUser()

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

      const spaceData = {
        clerkId: clerkId.id,
        name: spaceName,
        id: spaceId,
        isHost: true,
        createdAt: new Date().toISOString(),
      }
      console.log("Space data:", spaceData)

      const { data } = await axios.post("/api/space", spaceData)
      if (data.message !== "Space created") {
        toast.error("Failed to create space. Please try again.")
        throw new Error("Failed to create space")
      }

      if (data.message === "Space already exists") {
        toast.error("Space ID already exists. Please try again.")
        setIsCreating(false)
        return
      }

      await fetchSpaces() // Refetch spaces after creation

      setOpen(false)
      const { space } = data
      localStorage.setItem("musicVoteSpace", JSON.stringify(space))
      router.push(`/space/${space.id}`)
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast.error("Space limit reached. Please delete an existing space.")
        setOpen(false)
        router.push(`/myspaces`)
      } else {
        toast.error("Failed to create space. Please try again.")
      }
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
