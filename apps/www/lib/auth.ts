import { betterAuth } from "better-auth";
import { oneTap, emailOTP } from "better-auth/plugins";
import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";
import { importPKCS8, SignJWT } from "jose";
import mailer from "./mailer";
import { createTranslator } from "next-intl";
import { render } from '@react-email/render';
import LoginOtpMail from "@/emails/login/otp";
import { findUserByEmail } from "@/lib/entities/user";
import { routing } from "@/i18n/routing";

// Combine the app-local .env with the monorepo root .env (shared DB/service
// credentials). dotenv.config() never overrides an already-set var, so the
// local file loaded first takes precedence over the root one.
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Generate the client secret JWT required for 'Sign in with Apple'.
async function generateAppleClientSecret(clientId: string, teamId: string, keyId: string, privateKey: string) {
  const key = await importPKCS8(privateKey, "ES256");
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setSubject(clientId)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt(now)
    .setExpirationTime(now + 180 * 24 * 60 * 60)
    .sign(key);
}

export const auth = betterAuth({
  user: {
    additionalFields: {
      home_uri: {
        type: "string",
        required: false,
        nullable: true,
      }
    }
  },
  database: new Pool({
    connectionString: process.env.DATABASE_URL
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.BETTER_AUTH_EMAIL_VERIFICATION == '1'
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log('Sending mail via k@rnet')
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    },
    /*linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
    },*/
    apple: async () => ({
      clientId: process.env.APPLE_CLIENT_ID as string,
      clientSecret: await generateAppleClientSecret(
        process.env.APPLE_CLIENT_ID!,
        process.env.APPLE_TEAM_ID!,
        process.env.APPLE_KEY_ID!,
        process.env.APPLE_PRIVATE_KEY!,
      ),
      // Optional
      appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
    })
  },
  trustedOrigins: ["https://appleid.apple.com"],
  plugins: [
    oneTap({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          const lead = await findUserByEmail(email)
          // This runs as a Better Auth background task, detached from the request,
          // so next-intl's request-scoped locale detection (next/root-params) isn't
          // available here. Indicate the locale explicitly and build the translator
          // directly from the messages file instead of going through getTranslations().
          const messages = (await import(`@/messages/${lead.locale}.json`)).default;
          const __ = createTranslator({ locale: lead.locale, messages });
          const text = __(`Indro_code`, {otp})
          const html = await render(LoginOtpMail({ ...lead, otp }))
          await mailer({
            to: email,
            subject: __(`Inty ny code idiranao`),
            html,
            text
          })
        } else if (type === "email-verification") {
          // Send the OTP for email verification
        } else {
          // Send the OTP for password reset
        }
      },
    })
  ],
})