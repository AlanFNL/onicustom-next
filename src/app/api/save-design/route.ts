import { NextRequest, NextResponse } from "next/server";

interface SaveDesignRequest {
  email: string;
  productId: string;
  productTitle: string;
  code: string;
  timestamp: string;
  imageUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse JSON data (client uploads image directly to ImgBB first)
    const body = await request.json();
    const { email, productId, productTitle, code, timestamp, imageUrl } = body;

    // Validate required fields
    if (
      !email ||
      !productId ||
      !productTitle ||
      !code ||
      !timestamp ||
      !imageUrl
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Get environment variables
    const googleSheetsEndpoint = process.env.GOOGLE_SHEETS_ENDPOINT;

    if (!googleSheetsEndpoint) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error",
        },
        { status: 500 }
      );
    }

    // Save data to Google Sheets
    const sheetsData = new URLSearchParams();
    sheetsData.append("text", email);
    sheetsData.append("imageUrl", imageUrl);
    sheetsData.append("timestamp", timestamp);
    sheetsData.append("code", code);
    sheetsData.append("productId", productId);
    sheetsData.append("productTitle", productTitle);

    const sheetsResponse = await fetch(googleSheetsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: sheetsData.toString(),
    });

    if (!sheetsResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Google Sheets save failed: ${sheetsResponse.status}`,
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: "Design saved successfully",
      data: {
        imageUrl: imageUrl,
        code: code,
      },
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
