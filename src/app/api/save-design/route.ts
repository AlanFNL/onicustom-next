import { NextRequest, NextResponse } from "next/server";

interface SaveDesignRequest {
  email: string;
  productId: string;
  productTitle: string;
  code: string;
  timestamp: string;
  image: File;
}

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();

    // Extract data from form
    const email = formData.get("email") as string;
    const productId = formData.get("productId") as string;
    const productTitle = formData.get("productTitle") as string;
    const code = formData.get("code") as string;
    const timestamp = formData.get("timestamp") as string;
    const imageFile = formData.get("image") as File;

    // Validate required fields
    if (
      !email ||
      !productId ||
      !productTitle ||
      !code ||
      !timestamp ||
      !imageFile
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    if (imageFile.size > maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          message: `File size too large. Maximum allowed size is 10MB. Your file is ${Math.round(
            imageFile.size / (1024 * 1024)
          )}MB.`,
        },
        { status: 413 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed",
        },
        { status: 400 }
      );
    }

    // Get environment variables
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    const googleSheetsEndpoint = process.env.GOOGLE_SHEETS_ENDPOINT;

    if (!imgbbApiKey || !googleSheetsEndpoint) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error",
        },
        { status: 500 }
      );
    }

    // Step 1: Upload image to ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append("image", imageFile);
    imgbbFormData.append("key", imgbbApiKey);

    const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbFormData,
    });

    if (!imgbbResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Image upload failed: ${imgbbResponse.status}`,
        },
        { status: 500 }
      );
    }

    const imgbbData = await imgbbResponse.json();

    if (!imgbbData.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Image upload failed",
        },
        { status: 500 }
      );
    }

    // Step 2: Save data to Google Sheets
    const sheetsData = new URLSearchParams();
    sheetsData.append("text", email);
    sheetsData.append("imageUrl", imgbbData.data.url);
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
        imageUrl: imgbbData.data.url,
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
