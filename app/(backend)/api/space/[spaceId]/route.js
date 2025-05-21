import redisclient from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const { spaceId } = params;

        const spaceDetails = await redisclient.get(`space:${spaceId}`);

        if (!spaceDetails) {
            return NextResponse.json({ message: "No space found" }, { status: 404 });
        }

        return NextResponse.json({ message: "success", spaceDetails: JSON.parse(spaceDetails) }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "failure", error: error.message }, { status: 500 });
    }
}

export const DELETE = async (req, { params }) => {
    try {
        const { spaceId } = params;

        if (!spaceId) {
            return NextResponse.json({ message: "No space ID provided" }, { status: 400 })
        }

        await redisclient.del(`space:${spaceId}`)
        await redisclient.del(`songs:${spaceId}`)

        return NextResponse.json({ message: "Space deleted" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "failure", error: error.message }, { status: 500 })
    }
}