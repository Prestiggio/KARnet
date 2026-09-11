import { withRateLimiter } from "@/lib/withRateLimiter";
import { withRecaptcha } from "@/lib/withRecaptcha";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const POST = withRateLimiter(withRecaptcha(async (req: NextRequest) => {
    const user = await req.json()
    const response = await auth.api.sendVerificationOTP({
        body: {
            email: user.email,
            type: "sign-in",
        },
    });
    return NextResponse.json(response)
}))