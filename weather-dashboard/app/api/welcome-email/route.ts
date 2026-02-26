import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Missing name or email" }, { status: 400 });
    }

    const success = await sendWelcomeEmail(name, email);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
  } catch (error) {
    console.error("[Welcome Email API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
