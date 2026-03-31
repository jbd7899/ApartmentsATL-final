import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  // Extract the key from /api/images/uploads/uuid/filename
  const key = url.pathname.replace(/^\/api\/images\//, "");

  if (!key) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const imageStore = getStore("images");
    const result = await imageStore.getWithMetadata(key, { type: "blob" });

    if (!result) {
      return new Response("Image not found", { status: 404 });
    }

    const contentType = result.metadata?.contentType || "application/octet-stream";
    const arrayBuffer = await result.data.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new Response("Error serving image", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/images/*",
  method: ["GET"],
};
