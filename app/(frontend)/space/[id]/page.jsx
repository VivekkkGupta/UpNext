"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Plus, Share2, Music, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import axios from "axios"
import Image from "next/image"

function formatNumber(num) {
  if (!num) return "0"
  num = Number(num)
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K"
  return num.toString()
}

// YouTube video ID extraction function
function extractYouTubeID(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export default function SpacePage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [spaceInfo, setSpaceInfo] = useState(null)
  const [songs, setSongs] = useState([])
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [isAddingOpen, setIsAddingOpen] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)
  const playerRef = useRef(null)
  const playerContainerRef = useRef(null)


  const fetchSongs = async () => {
    try {
      const { data } = await axios.get(`/api/songqueue/${id}`)
      if (data.message === "success") {
        setSongs(data.songs)
      } else {
        toast.error("Failed to fetch songs")
      }
      console.log("Fetched Songs:", data.songs)
      setCurrentlyPlaying(data.songs[0] || null)
    } catch (error) {
      toast.error("Failed to fetch songs")
      console.error(error)
    }
  }

  const fetchSpaceInfo = async () => {
    try {
      const { data } = await axios.get(`/api/space/${id}`)
      if (data.message === "success") {
        setSpaceInfo(data.space)
      } else {
        toast.error("Failed to fetch space info")
      }
      console.log("Fetched Space Info:", data.space)
    } catch (error) {
      toast.error("Failed to fetch space info")
      console.error(error)
    }
  }

  // Fetch songs when the component mounts
  useEffect(() => {
    // setting space Info
    console.log("fetching space info...")
    fetchSpaceInfo()
    
    console.log("fetching songs...")
    fetchSongs()
  }, [])


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

  const handleAddVideo = async () => {
    if (!newVideoUrl) return

    const videoId = extractYouTubeID(newVideoUrl)
    if (!videoId) {
      toast.error("Please enter a valid YouTube video URL")
      return
    }

    try {
      // Fetch video details from YouTube API
      const { data } = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
      )
      const videoDetails = data.items[0]
      if (!videoDetails) {
        toast.error("Video not found or unavailable")
        return
      }

      // Format duration
      function formatDuration(isoDuration) {
        const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
        const hours = (parseInt(match[1]) || 0)
        const minutes = (parseInt(match[2]) || 0)
        const seconds = (parseInt(match[3]) || 0)
        return [
          hours > 0 ? String(hours).padStart(2, "0") : null,
          String(minutes).padStart(2, "0"),
          String(seconds).padStart(2, "0"),
        ]
          .filter(Boolean)
          .join(":")
      }

      const videoData = {
        id: Date.now().toString(),
        title: videoDetails.snippet.title,
        artist: videoDetails.snippet.channelTitle,
        videoId,
        thumbnailUrl: videoDetails.snippet.thumbnails.default.url,
        votes: 0,
        addedBy: spaceInfo.username || "Host",
        videoDuration: formatDuration(videoDetails.contentDetails.duration),
        viewCount: videoDetails.statistics.viewCount,
        likeCount: videoDetails.statistics.likeCount,
      }
      console.log("Video Data:", videoData)
      // Send to backend
      const response = await axios.post(`/api/songqueue/${id}`, videoData)
      console.log("Response Data:", response.data)
      // Update local state
      setSongs((prev) => [...prev, videoData])
      setNewVideoUrl("")
      setIsAddingOpen(false)
      toast.success("Your video has been added to the queue")
    } catch (error) {
      toast.error("Failed to add video. Please try again.")
      console.error(error)
    }
  }

  const handleRemoveSong = async (songId) => {
    try {
      const { data } = await axios.delete(`/api/songqueue/${id}`, { data: { id: songId } })
      if (data.message === "Song deleted") {
        setSongs(data.songs)
        toast.success("Song removed from queue")
      } else {
        toast.error("Failed to remove song")
      }
    } catch (error) {
      toast.error("Failed to remove song")
      console.error(error)
    }
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
    toast.success(`Space ID ${id} copied to clipboard`)
  }

  if (!spaceInfo) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black ">

      <main className="container mx-auto px-4 py-6 max-w-[1240px] mx-auto">
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
                      <Button size="sm" className="text-white bg-purple-600 hover:bg-purple-700">
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
                    disabled={songs.length === 0 || true}
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
                    <Card key={song.id} className="overflow-hidden bg-gray-800 text-white p-0">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between p-2">
                          {/* Rank number */}
                          <div className="flex h-full w-12 flex-shrink-0 items-center justify-center bg-purple-900 p-4 text-xl font-bold">
                            #{index + 1}
                          </div>

                          {/* Thumbnail */}
                          <div className="ml-2 border border-gray-200 rounded-md overflow-hidden relative flex items-center">
                            <Image
                              src={song.thumbnailUrl}
                              alt={song.title}
                              width={112}
                              height={64}
                              className="h-16 w-28 rounded object-cover"
                            />
                            <div className="absolute bottom-1 right-1 rounded bg-black bg-opacity-70 px-2 py-0.5 text-xs">
                              {song.videoDuration}
                            </div>
                          </div>

                          {/* Song info */}
                          <div className="flex flex-1 flex-col justify-between p-3">
                            <div>
                              <h3 className="line-clamp-1 font-medium text-white">{song.title}</h3>
                              <p className="text-sm text-purple-300">{song.artist}</p>
                            </div>

                            <div className="mt-1 flex items-center text-xs text-gray-400">
                              <span className="mr-3">{Number.parseInt(song.viewCount).toLocaleString()} views</span>
                              <span>{Number.parseInt(song.likeCount).toLocaleString()} likes</span>
                              <span className="ml-auto text-gray-500">Added by {song.addedBy}</span>


                              {spaceInfo.isHost && (
                                <div className="ml-2 mr-2">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full text-gray-400 hover:bg-red-500 hover:text-white"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-gray-800 text-white">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Remove Song</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400">
                                          Are you sure you want to remove this song from the queue?
                                          <div className="mt-2 flex items-center space-x-2">
                                            <div className="h-10 w-10 overflow-hidden rounded">
                                              <Image
                                                src={song.thumbnailUrl || "/placeholder.svg"}
                                                alt={song.title}
                                                width={40}
                                                height={40}
                                                className="h-full w-full object-cover"
                                              />
                                            </div>
                                            <div className="text-white">
                                              <p className="line-clamp-1 text-sm font-medium">{song.title}</p>
                                              <p className="text-xs text-gray-400">{song.artist}</p>
                                            </div>
                                          </div>
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-red-500 hover:bg-red-700"
                                          onClick={() => handleRemoveSong(song.id)}
                                        >
                                          Remove
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Voting */}
                          <div className="flex flex-col items-center justify-center bg-gray-700 px-4 py-2 rounded-tr-lg rounded-br-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-gray-300 hover:bg-purple-900 hover:text-white"
                              onClick={() => handleVote(song.id, "up")}
                            >
                              <ArrowUp className="h-5 w-5" />
                            </Button>
                            <span className="my-1 text-lg font-semibold">{song.votes}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-gray-300 hover:bg-gray-600 hover:text-white"
                              onClick={() => handleVote(song.id, "down")}
                            >
                              <ArrowDown className="h-5 w-5" />
                            </Button>
                          </div>
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
