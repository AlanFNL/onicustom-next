import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch designs and product titles in parallel
    const [designsResult, titlesResult] = await Promise.all([
      supabase.from("designs").select("*").order("created_at", { ascending: false }),
      supabase.from("product_titles").select("*").order("created_at", { ascending: false }),
    ]);

    if (designsResult.error) {
      console.error("Error fetching designs:", designsResult.error);
      return NextResponse.json(
        {
          success: false,
          message: designsResult.error.message,
        },
        { status: 500 }
      );
    }

    if (titlesResult.error) {
      console.error("Error fetching product titles:", titlesResult.error);
      return NextResponse.json(
        {
          success: false,
          message: titlesResult.error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      designs: designsResult.data || [],
      productTitles: titlesResult.data || [],
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

