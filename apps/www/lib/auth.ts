import { betterAuth } from "better-auth";
import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";
import { importPKCS8, SignJWT } from "jose";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Generate the client secret JWT required for 'Sign in with Apple'.
async function generateAppleClientSecret(clientId, teamId, keyId, privateKey) {
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
    connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
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
})