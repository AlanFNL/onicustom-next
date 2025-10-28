import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productTitle, timestamp } = body;

    // Validate required fields
    if (!productTitle || !timestamp) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert into product_titles table
    const { error } = await supabase.from("product_titles").insert({
      product_title: productTitle,
      timestamp: new Date(timestamp).toISOString(),
    });

    if (error) {
      console.error("Supabase product title insert error:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to track download: ${error.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Download tracked successfully",
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

