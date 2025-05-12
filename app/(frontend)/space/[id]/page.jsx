"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Plus, Share2, Music } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// YouTube video ID extraction function
function extractYouTubeID(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export default function SpacePage({ params }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const [spaceInfo, setSpaceInfo] = useState(null)
  const [songs, setSongs] = useState([])
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [isAddingOpen, setIsAddingOpen] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)
  const playerRef = useRef(null)
  const playerContainerRef = useRef(null)

  useEffect(() => {
    // Check if user has space info in localStorage
    const storedSpace = localStorage.getItem("musicVoteSpace")

    if (!storedSpace) {
      // Redirect to home if no space info
      router.push("/")
      return
    }

    const spaceData = JSON.parse(storedSpace)

    // Verify the ID matches
    if (spaceData.id !== id) {
      router.push("/")
      return
    }

    setSpaceInfo(spaceData)

    // Load mock songs data
    // In a real app, you would fetch this from a database
    setSongs([
      {
        id: "1",
        title: "Never Gonna Give You Up",
        artist: "Rick Astley",
        videoId: "dQw4w9WgXcQ",
        votes: 15,
        addedBy: "Host",
      },
      {
        id: "2",
        title: "Bohemian Rhapsody",
        artist: "Queen",
        videoId: "fJ9rUzIMcZQ",
        votes: 12,
        addedBy: "User123",
      },
      {
        id: "3",
        title: "Billie Jean",
        artist: "Michael Jackson",
        videoId: "Zi_XfYBgRgw",
        votes: 8,
        addedBy: "MusicFan42",
      },
    ])

    // Set the first song as currently playing
    setCurrentlyPlaying({
      id: "1",
      title: "Never Gonna Give You Up",
      artist: "Rick Astley",
      videoId: "dQw4w9WgXcQ",
    })

    // Load YouTube API
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = initializePlayer
    } else {
      initializePlayer()
    }

    return () => {
      window.onYouTubeIframeAPIReady = null
    }
  }, [id, router])

  const initializePlayer = () => {
    if (!currentlyPlaying || !playerContainerRef.current) return

    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      height: "100%",
      width: "100%",
      videoId: currentlyPlaying.videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
      },
      events: {
        onStateChange: onPlayerStateChange,
      },
    })
  }

  const onPlayerStateChange = (event) => {
    // When video ends, play the next most voted song
    if (event.data === window.YT.PlayerState.ENDED) {
      playNextSong()
    }
  }

  const handleAddVideo = () => {
    if (!newVideoUrl) return

    const videoId = extractYouTubeID(newVideoUrl)

    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would fetch video details from YouTube API
    // For now, we'll just use a placeholder
    const newSong = {
      id: Date.now().toString(),
      title: "New YouTube Video",
      artist: "Unknown",
      videoId,
      votes: 0,
      addedBy: spaceInfo.username || "Host",
    }

    setSongs((prev) => [...prev, newSong])
    setNewVideoUrl("")
    setIsAddingOpen(false)

    toast({
      title: "Video added",
      description: "Your video has been added to the queue",
    })
  }

  const handleVote = (songId, direction) => {
    setSongs((prev) =>
      prev.map((song) => {
        if (song.id === songId) {
          return {
            ...song,
            votes: direction === "up" ? song.votes + 1 : Math.max(0, song.votes - 1),
          }
        }
        return song
      }),
    )
  }

  const playNextSong = () => {
    if (!spaceInfo?.isHost || songs.length === 0) return

    // Sort songs by votes
    const sortedSongs = [...songs].sort((a, b) => b.votes - a.votes)
    const nextSong = sortedSongs[0]

    // Remove from queue and set as currently playing
    setSongs((prev) => prev.filter((song) => song.id !== nextSong.id))
    setCurrentlyPlaying(nextSong)

    // Update the player
    if (playerRef.current) {
      playerRef.current.loadVideoById(nextSong.videoId)
    }
  }

  const handleShareSpace = () => {
    navigator.clipboard.writeText(id)
    toast({
      title: "ID copied!",
      description: `Space ID ${id} copied to clipboard`,
    })
  }

  if (!spaceInfo) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{spaceInfo.name || "Music Space"}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-gray-400">
                ID: {id}
              </Badge>
              <Button variant="ghost" size="icon" onClick={handleShareSpace} className="h-6 w-6 text-gray-400">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left side: Song list */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Song Queue</h2>

              {spaceInfo.isHost && (
                <div className="flex gap-2">
                  <Dialog open={isAddingOpen} onOpenChange={setIsAddingOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="mr-1 h-4 w-4" /> Add Video
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 text-white sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add YouTube Video</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Paste a YouTube video URL to add to the queue
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Input
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={newVideoUrl}
                            onChange={(e) => setNewVideoUrl(e.target.value)}
                            className="border-gray-700 bg-gray-900 text-white"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddingOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={handleAddVideo}
                          disabled={!newVideoUrl}
                        >
                          Add Video
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-600 text-purple-400 hover:bg-gray-700 hover:text-purple-300"
                    onClick={playNextSong}
                    disabled={songs.length === 0}
                  >
                    Play Next
                  </Button>
                </div>
              )}
            </div>

            {songs.length === 0 ? (
              <Card className="bg-gray-800 text-white">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <Music className="mb-2 h-12 w-12 text-gray-500" />
                  <p className="text-gray-400">No songs in the queue</p>
                  <p className="text-sm text-gray-500">
                    {spaceInfo.isHost ? "Add a YouTube video to get started" : "Wait for the host to add videos"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {[...songs]
                  .sort((a, b) => b.votes - a.votes)
                  .map((song, index) => (
                    <Card key={song.id} className="bg-gray-800 text-white">
                      <CardContent className="flex items-center p-4">
                        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-lg font-bold">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{song.title}</h3>
                          <p className="text-sm text-gray-400">{song.artist}</p>
                          <p className="text-xs text-gray-500">Added by {song.addedBy}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                            onClick={() => handleVote(song.id, "up")}
                          >
                            <ArrowUp className="h-5 w-5" />
                          </Button>
                          <span className="text-lg font-semibold">{song.votes}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                            onClick={() => handleVote(song.id, "down")}
                          >
                            <ArrowDown className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>

          {/* Right side: YouTube player */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-white">Now Playing</h2>
            <div className="overflow-hidden rounded-lg bg-black">
              <div className="aspect-video w-full" ref={playerContainerRef}></div>
            </div>
            {currentlyPlaying && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-white">{currentlyPlaying.title}</h3>
                <p className="text-gray-400">{currentlyPlaying.artist}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
