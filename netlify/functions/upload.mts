import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { requireAdmin, jsonResponse } from "../../lib/auth";
import { randomUUID } from "crypto";

export default async (req: Request, context: Context) => {
  const admin = requireAdmin(req);
  if (admin instanceof Response) return admin;

  try {
    const contentType = req.headers.get("content-type") || "";

    // Handle multipart form data (file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return jsonResponse({ error: "No file provided" }, 400);
      }

      const imageStore = getStore("images");
      const key = `uploads/${randomUUID()}/${file.name}`;
      const buffer = await file.arrayBuffer();

      await imageStore.set(key, new Blob([buffer]), {
        metadata: {
          contentType: file.type,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      // Return the path that can be used to retrieve the image
      const imageUrl = `/api/images/${key}`;
      return jsonResponse({ uploadURL: imageUrl, key, imageUrl });
    }

    // Handle JSON request (get a pre-signed upload key)
    const imageStore = getStore("images");
    const key = `uploads/${randomUUID()}`;

    return jsonResponse({
      uploadURL: `/api/images/${key}`,
      key,
      imageUrl: `/api/images/${key}`,
    });
  } catch (error) {
    console.error("Error in upload function:", error);
    return jsonResponse({ error: "Failed to process upload" }, 500);
  }
};

export const config: Config = {
  path: "/api/upload",
  method: ["POST"],
};
