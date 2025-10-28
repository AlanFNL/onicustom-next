import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file provided",
        },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (
      !process.env.IMAGEKIT_PUBLIC_KEY ||
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.IMAGEKIT_URL_ENDPOINT
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ImageKit configuration missing",
        },
        { status: 500 }
      );
    }

    // Initialize ImageKit
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload with no transformations (raw image)
    const result = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: "/onicustom", // Optional: organize files in a folder
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      filePath: result.filePath,
    });
  } catch (error) {
    console.error("ImageKit upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image",
      },
      { status: 500 }
    );
  }
}
