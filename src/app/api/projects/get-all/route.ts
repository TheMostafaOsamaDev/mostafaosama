import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  const projects = await prisma.projects.findMany();

  return NextResponse.json(projects);
}
