import { useState, useEffect } from "react";
import Button from "./Button";

const AuthComponent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/session/validate", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          // Get full user profile
          const userResponse = await fetch("/api/me", {
            credentials: "include",
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData.user);
          }
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (provider) => {
    window.location.href = `/auth/${provider}`;
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok || response.status === 204) {
        setUser(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback to GET logout
      window.location.href = "/auth/logout";
    }
  };

  const handleViewProfile = () => {
    window.open("/api/me", "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
          🔐 OAuth2.0 Demo
        </h1>

        {user ? (
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex flex-col items-center text-center">
                <img
                  src={user.avatar || "/default-avatar.svg"}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full mb-4 border-2 border-pink-400"
                />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {user.name}
                </h3>
                <p className="text-gray-300 mb-3">
                  {user.email || "No email provided"}
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    user.provider === "google"
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  }`}
                >
                  {user.provider.toUpperCase()}
                </span>
                {user.tag && (
                  <p className="text-sm text-gray-400 mt-2">{user.tag}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleViewProfile}
                className="w-full"
              >
                📊 View Profile JSON
              </Button>

              <Button
                variant="logout"
                onClick={handleLogout}
                className="w-full"
              >
                🚪 Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-center text-gray-300 mb-6">
              Choose your preferred authentication provider:
            </p>

            <div className="space-y-3">
              <Button
                variant="google"
                onClick={() => handleLogin("google")}
                className="w-full flex items-center justify-center gap-2"
              >
                📧 Continue with Google
              </Button>

              <Button
                variant="discord"
                onClick={() => handleLogin("discord")}
                className="w-full flex items-center justify-center gap-2"
              >
                💬 Continue with Discord
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-center text-xs text-gray-400">
            Powered by Next.js + RetroUI
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
