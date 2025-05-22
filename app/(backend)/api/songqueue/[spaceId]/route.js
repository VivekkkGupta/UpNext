
import redisclient from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const { spaceId } = await params;
        const songs = await redisclient.get(`songs:${spaceId}`);
        if (!songs) {
            return NextResponse.json({ message: "No songs found" }, { status: 404 });
        }
        return NextResponse.json({ message: "success", songs: JSON.parse(songs) }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "failure", error: error.message }, { status: 500 });
    }
}

export const POST = async (req, { params }) => {
    try {
        const { spaceId } = await params
        const newSong = await req.json();

        // Get current songs array
        const songsRaw = await redisclient.get(`songs:${spaceId}`);
        let songs = [];
        if (songsRaw) {
            songs = JSON.parse(songsRaw);
        }

        // Add new song
        songs.push(newSong);
        // console.log("songs", songs);

        // Save back to Redis
        await redisclient.set(`songs:${spaceId}`, JSON.stringify(songs));

        return NextResponse.json({ message: "Song added", songs }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "failure", error: error.message }, { status: 500 });
    }
}

export const DELETE = async (req,{params}) => {
    try {
        const { spaceId } = await params
        const { id: songId } = await req.json()

        const songsRaw = await redisclient.get(`songs:${spaceId}`)
        let songs = []
        if (songsRaw) songs = JSON.parse(songsRaw)

        const updatedSongs = songs.filter((song) => song.id !== songId)
        await redisclient.set(`songs:${spaceId}`, JSON.stringify(updatedSongs))

        return NextResponse.json({ message: "Song deleted", songs: updatedSongs }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "failure", error: error.message }, { status: 500 })
    }
}