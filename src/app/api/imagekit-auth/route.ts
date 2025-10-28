import ImageKit from "imagekit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function GET() {
  try {
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

    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    const authParams = imagekit.getAuthenticationParameters();

    return NextResponse.json({
      success: true,
      signature: authParams.signature,
      expire: authParams.expire,
      token: authParams.token,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate ImageKit auth parameters",
      },
      { status: 500 }
    );
  }
}
