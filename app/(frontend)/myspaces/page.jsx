"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useAppContext } from "@/contexts/AppContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function MySpacesPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const { spaces, setSpaces, spacesLoading } = useAppContext()
    const [deleteId, setDeleteId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const router = useRouter()

    // Filter spaces for this user
    const mySpaces = spaces.filter(s => s.userId === user?.id || s.clerkId === user?.id)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) {
            router.push("/")
        }
    }, [isLoaded, isSignedIn, router])

    const handleDelete = async () => {
        if (!deleteId) return
        setDeleting(true)
        try {
            const res = await axios.delete(`/api/space/${deleteId}`)
            const data = await res.data
            if (data.message === "Space deleted") {
                setSpaces(prev => prev.filter(s => s.id !== deleteId))
                toast.success("Space deleted")
            } else {
                toast.error(data.message || "Failed to delete space")
            }
        } catch {
            toast.error("Failed to delete space")
        } finally {
            setDeleting(false)
            setDeleteId(null)
        }
    }

    return (
        <div className="max-w-[1240px] mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-white mb-8">My Spaces</h1>
            {/* Delete Dialog */}
            <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
                <DialogContent className="bg-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Delete Space</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this space? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteId(null)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-500 hover:bg-red-600"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {spacesLoading ? (
                <div className="text-gray-400">Loading...</div>
            ) : mySpaces.length === 0 ? (
                <div className="text-gray-400">You have not created any spaces yet.</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {mySpaces.map(space => (
                        <Card key={space.id} className="bg-gray-800 text-white">
                            <CardContent className="flex items-center justify-between p-6">
                                <div>
                                    <h2 className="text-xl font-semibold">{space.name}</h2>
                                    <p className="text-gray-400 text-sm mb-2">ID: {space.id}</p>
                                    <p className="text-gray-500 text-xs">Created: {new Date(space.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-red-400 hover:bg-gray-700 hover:text-red-600"
                                        onClick={() => setDeleteId(space.id)}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-purple-400 hover:bg-purple-700"
                                        onClick={() => router.push(`/space/${space.id}`)}
                                        title="Go to space"
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}