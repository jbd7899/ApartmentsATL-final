import type { Context, Config } from "@netlify/functions";
import { storage } from "../../lib/storage";
import { jsonResponse } from "../../lib/auth";
import { sendApartmentFinderNotification } from "../../lib/emailService";
import { insertApartmentFinderSubmissionSchema } from "@shared/schema";

export default async (req: Request, context: Context) => {
  try {
    const body = await req.json();
    const validation = insertApartmentFinderSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return jsonResponse({ error: "Invalid submission data", details: validation.error }, 400);
    }

    const submission = await storage.createApartmentFinderSubmission(validation.data);

    // Send email notification (don't wait for it to complete)
    sendApartmentFinderNotification(submission).catch(err => {
      console.error("Failed to send email notification:", err);
    });

    return jsonResponse(submission, 201);
  } catch (error) {
    console.error("Error creating apartment finder submission:", error);
    return jsonResponse({ error: "Failed to create submission" }, 500);
  }
};

export const config: Config = {
  path: "/api/apartment-finder",
  method: ["POST"],
};
