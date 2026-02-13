import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface ArtesanalOrderBody {
  fullName: string;
  email: string;
  phone: string | null;
  character: string;
  note: string | null;
  imageUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ArtesanalOrderBody;
    const { fullName, email, phone, character, note, imageUrl } = body;

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !character?.trim() ||
      !imageUrl?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Faltan campos obligatorios: nombre, email, personaje o imagen.",
        },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("artesanal_orders").insert({
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      character: character.trim(),
      note: note?.trim() || null,
      image_url: imageUrl.trim(),
    });

    if (error) {
      console.error("Artesanal order insert error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: "Pedido registrado." });
  } catch (error) {
    console.error("API artesanal-order error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
