// src/meta/api.ts
import { WhatsAppBusinessManagement } from "facebook-whatsapp-business-nodejs-sdk";
import config from "@/config";

const client = new WhatsAppBusinessManagement({
  accessToken: process.env.META_ACCESS_TOKEN || "",
  appId: process.env.META_APP_ID || "",
  appSecret: process.env.META_APP_SECRET || "",
});

/**
 * Validate a phone number using Meta's WhatsApp Business Cloud API.
 * Returns { valid: boolean, status: string }.
 */
export async function validateNumber(phone: string) {
  try {
    const result = await client.phoneNumberId.checkPhoneNumber({
      phoneNumber: phone,
      // The API expects international format without '+'
    });
    // The SDK returns { valid: boolean, status: string }
    return { valid: result.isValid, status: result.status };
  } catch (err) {
    console.error("Meta validation error", err);
    // Treat errors as unknown – caller can decide to retry
    return { valid: false, status: "error" };
  }
}
