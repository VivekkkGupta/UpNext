
import redisclient from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        // return all spaces
        const spaces = await redisclient.keys("space:*")
        if(spaces.length === 0) {
            return NextResponse.json({ message: "No spaces found" }, { status: 404 });
        }

        const spaceDetails = await Promise.all(spaces.map(async (space) => {
            const spaceData = await redisclient.get(space);
            return JSON.parse(spaceData);
        }
        ));
        console.log("spaces", spaceDetails);

        return NextResponse.json({ message: "success", spaces: spaceDetails }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "failure", error: error.message }, { status: 500 });
    }
}

export const POST = async (req) => {
    try {
        const spaceData = await req.json();
        const { name, id, isHost, createdAt,userId } = spaceData;

        if (!name || !id || !isHost || !createdAt || !userId) {
            return NextResponse.json({ message: "Invalid space data" }, { status: 400 });
        }
        const existingSpace = await redisclient.get(`space:${id}`);
        if (existingSpace) {
            return NextResponse.json({ message: "Space already exists" }, { status: 409 });
        }

        // create space and make it empty 
        await redisclient.set(`space:${id}`, JSON.stringify(spaceData));

        // create empty songs array
        await redisclient.set(`songs:${id}`, JSON.stringify([]));

        return NextResponse.json({ message: "Space created" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "failure", error: error.message }, { status: 500 });
    }
}

