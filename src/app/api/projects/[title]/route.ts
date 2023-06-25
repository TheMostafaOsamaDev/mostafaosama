import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function GET( req: Request ) {
  const { pathname } = new URL(req.url)
  const title = pathname.slice(14).trim().split('-').join(' ');

  const res = await prisma.projects.findFirst({
    where: {
      title: {
        mode: "insensitive",
        equals: title
      }
    }
  })

  if(!res) {
    return NextResponse.json({ message: "Project not found!" }, {
      status: 404
    });
  }

  return NextResponse.json(res);
}