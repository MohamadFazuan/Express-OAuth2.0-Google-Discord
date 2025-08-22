// Next.js API route that proxies to Express backend
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Forward cookies for session management
        Cookie: req.headers.cookie || "",
      },
      credentials: "include",
    });

    const data = await response.json();

    // Forward the status code from the backend
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error proxying to backend:", error);
    res.status(500).json({
      success: false,
      error: "Failed to connect to backend",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
}
