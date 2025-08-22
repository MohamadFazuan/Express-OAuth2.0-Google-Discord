// Next.js API route for session validation
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/session/validate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.cookie || "",
      },
      credentials: "include",
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error validating session:", error);
    res.status(500).json({
      valid: false,
      authenticated: false,
      error: "Failed to validate session",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
}
