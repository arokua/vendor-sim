import { NextResponse } from "next/server";
import { validateChangeRequest } from "@/app/lib/validation";
import { computeChange } from "@/app/lib/changeMaking";

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => {
      throw new Error("Invalid JSON payload.");
    });

    // Extract validated fields (including debug)
    const { cashRegister, paymentAmount, debug } = validateChangeRequest(json);

    const result = computeChange(cashRegister, paymentAmount, {
      debug: Boolean(debug)
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message ?? "Unable to compute change.",
          debug: result.debug ?? null
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        change: result.change,
        coinUsage: result.coinUsage,
        updatedRegister: result.updatedRegister,
        debug: result.debug ?? null
      },
      { status: 200 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error.";

    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}
