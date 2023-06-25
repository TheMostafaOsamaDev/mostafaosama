import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  const skills = await prisma.skills.findMany();

  return NextResponse.json(skills);
}