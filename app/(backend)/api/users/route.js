import { prisma } from "@/lib/prismaclient";
import { NextResponse } from "next/server";

export const GET = async (req, res) => {
    const users = await prisma.user.findMany();
    if(!users) {
        return NextResponse.json({ message: "No users found" }, { status: 404 });
    }
    return NextResponse.json(users);
}

export const POST = async (req, res) => {
  const { name, email } = await req.json();
  const user = await prisma.user.create({
    data: {
      name,
      email,
    },
  });
  return NextResponse.json(user);
};
