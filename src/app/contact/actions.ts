"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = process.env.CONTACT_EMAIL ?? "hello@jam.meanjin";

export type ContactResult = {
  success: boolean;
  message: string;
};

export async function submitContact(
  _prev: ContactResult | null,
  formData: FormData
): Promise<ContactResult> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const body = formData.get("message")?.toString().trim();

  if (!name || !email || !body) {
    return { success: false, message: "Please fill in all fields." };
  }

  if (body.length > 5000) {
    return { success: false, message: "Message is too long (max 5 000 characters)." };
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: TO_EMAIL,
      replyTo: email,
      subject: `[JAM Contact] ${name}`,
      text: `From: ${name} <${email}>\n\n${body}`,
    });

    return { success: true, message: "Thanks! We'll get back to you soon." };
  } catch {
    return {
      success: false,
      message: "Something went wrong sending your message. Try emailing us directly.",
    };
  }
}
