// Next.js API route for logout
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.cookie || "",
      },
      credentials: "include",
    });

    const data = await response.json();

    // Clear cookies on successful logout
    if (response.ok) {
      res.setHeader("Set-Cookie", [
        "sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly",
        "connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly",
      ]);
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({
      success: false,
      error: "Failed to logout",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
}
