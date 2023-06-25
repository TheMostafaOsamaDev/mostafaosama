import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  const projects = await prisma.projects.findMany({where: {
    isTop: true
  }})

  return NextResponse.json(projects)
}