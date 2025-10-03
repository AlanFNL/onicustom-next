import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const imgbbApiKey = process.env.IMGBB_API_KEY;

    if (!imgbbApiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "ImgBB API key not configured",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      apiKey: imgbbApiKey,
    });
  } catch (error) {
    console.error("API route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
