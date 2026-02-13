import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES = ["pendiente", "contactado", "completado"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID requerido" },
        { status: 400 }
      );
    }

    if (
      !status ||
      !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Status inválido. Usá: pendiente, contactado o completado.",
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from("artesanal_orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Artesanal order update error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API artesanal-order PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
