import { auth } from "@/auth"
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()
  
  if (session) {
    return NextResponse.json({ data: "Protected data" })
  }
  
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
}