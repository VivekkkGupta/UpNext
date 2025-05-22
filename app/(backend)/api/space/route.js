import { SPACE_LIMIT } from "@/lib/constants";
import redisclient from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        // Get all spaces
        const spaces = await redisclient.keys("space:*");
        if (spaces.length === 0) {
            return NextResponse.json({ message: "No spaces found" }, { status: 404 });
        }

        const spaceDetails = await Promise.all(
            spaces.map(async (space) => {
                const spaceData = await redisclient.get(space);
                return JSON.parse(spaceData);
            })
        ); 
        // console.log("spaceDetails", spaceDetails);

        // If userId is provided, filter spaces by userId
        const filteredSpaces = userId
            ? spaceDetails.filter((space) => space.clerkId === userId)
            : spaceDetails;
        // console.log("filteredSpaces", filteredSpaces);

        return NextResponse.json({ message: "success", spaces: filteredSpaces }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "failure", error: error.message }, { status: 500 });
    }
}

export const POST = async (req) => {
    try {
        const spaceData = await req.json();
        const { name, id, userId } = spaceData;
        if (name === "" || id === "" || userId === "") {
            return NextResponse.json({ message: "Invalid space data" }, { status: 400 });
        }

        // Fetch all spaces for this user
        const allSpacesKeys = await redisclient.keys("space:*");
        const userSpaces = [];
        for (const key of allSpacesKeys) {
            const data = await redisclient.get(key);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.userId === userId) {
                    userSpaces.push(parsed);
                }
            }
        }

        if (userSpaces.length >= SPACE_LIMIT) {
            return NextResponse.json({ message: `Space limit reached (${SPACE_LIMIT}).` }, { status: 403 });
        }

        const existingSpace = await redisclient.get(`space:${id}`);
        if (existingSpace) {
            return NextResponse.json({ message: "Space already exists" }, { status: 409 });
        }

        // create space and make it empty 
        await redisclient.set(`space:${id}`, JSON.stringify(spaceData));

        // create empty songs array
        await redisclient.set(`songs:${id}`, JSON.stringify([]));

        return NextResponse.json({ message: "Space created", space: spaceData }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "failure", error: error.message }, { status: 500 });
    }
}

