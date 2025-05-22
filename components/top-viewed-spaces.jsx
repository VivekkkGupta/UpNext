"use client"
import { useAppContext } from "@/contexts/AppContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

function SpaceSkeleton() {
  return (
    <div className="flex items-center justify-between bg-gray-800 rounded-lg border-l-4 border-purple-600 p-4 animate-pulse">
      <div>
        <div className="h-5 w-32 bg-gray-700 rounded mb-2" />
        <div className="h-3 w-20 bg-gray-700 rounded" />
      </div>
      <div className="h-8 w-8 bg-gray-700 rounded-full" />
    </div>
  )
}

export default function TopViewedSpaces() {
  const { spaces, spacesLoading } = useAppContext()
  const router = useRouter()

  // Sort by viewCount descending, fallback to 0 if not present
  const topSpaces = [...spaces]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5)

  return (
    <Card className="bg-gray-900 text-white shadow-lg rounded-xl border-0">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-purple-400">Top Viewed Spaces</h2>
        {spacesLoading ? (
          <div className="grid gap-4">
            <SpaceSkeleton />
            <SpaceSkeleton />
            <SpaceSkeleton />
          </div>
        ) : topSpaces.length === 0 ? (
          <div className="text-gray-400">No spaces found.</div>
        ) : (
          <div className="grid gap-4">
            {topSpaces.map(space => (
              <div
                key={space.id}
                className="flex items-center justify-between bg-gray-800 rounded-lg border-l-4 border-purple-600 p-4 shadow transition hover:scale-[1.02] hover:border-purple-400"
              >
                <div>
                  <div className="font-semibold text-lg text-purple-300">{space.name}</div>
                  <div className="text-xs text-gray-400">ID: {space.id}</div>
                  {space.viewCount !== undefined && (
                    <div className="text-xs text-purple-400 font-semibold mt-1">
                      👁️ {space.viewCount} views
                    </div>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="text-purple-400 hover:bg-purple-700 hover:text-white cursor-pointer"
                  onClick={() => router.push(`/space/${space.id}`)}
                  title="Go to space"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}