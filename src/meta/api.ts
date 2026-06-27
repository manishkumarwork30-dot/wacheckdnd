// src/meta/api.ts
// import { WhatsAppBusinessManagement } from "facebook-whatsapp-business-nodejs-sdk";
import config from "@/config";

// const client = new WhatsAppBusinessManagement({
//   accessToken: process.env.META_ACCESS_TOKEN || "",
//   appId: process.env.META_APP_ID || "",
//   appSecret: process.env.META_APP_SECRET || "",
// });


/**
 * Validate a phone number using Meta's WhatsApp Business Cloud API.
 * Returns { valid: boolean, status: string }.
 */
export async function validateNumber(phone: string) {
  console.warn("validateNumber is currently a mock because Meta SDK is not configured.");
  return { valid: true, status: "mocked" };
}
