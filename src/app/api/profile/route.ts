import { NextResponse } from "next/server"
import { db } from "@/db"
import { userProfiles } from "@/db/schema"
import { getAuthUserId } from "@/db/auth"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const userId = await getAuthUserId()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const [profile] = await db
      .select({ profileData: userProfiles.profileData })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))

    return NextResponse.json({
      success: true,
      data: profile?.profileData ?? null,
    })
  } catch (error) {
    console.error("GET /api/profile error:", error)
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
