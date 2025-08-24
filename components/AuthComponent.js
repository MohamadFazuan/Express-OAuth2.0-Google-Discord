import { useState, useEffect } from "react";
import Button from "./Button";

const AuthComponent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  useEffect(() => {
    // Add pixel font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    checkAuthStatus();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.logout-menu-container')) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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

  const handleLogout = () => {
    // Navigate to logout confirmation page
    window.location.href = '/logout';
  };

  const handleAdvancedLogout = () => {
    // Navigate to advanced logout page
    window.location.href = '/logout-advanced';
  };

  const handleQuickLogout = async () => {
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        window.location.href = '/?message=logged_out';
      }
    } catch (error) {
      console.error("Quick logout failed:", error);
      window.location.href = "/auth/logout";
    }
  };

  const handleViewProfile = () => {
    window.open("/api/me", "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black text-xl" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Retro Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      <div className="relative z-10 bg-gray-100 border-4 border-black p-8 max-w-md w-full shadow-lg">
        <h1 
          className="text-3xl text-center mb-8 text-black"
          style={{ 
            fontFamily: "'Press Start 2P', monospace",
            textShadow: '2px 2px 0px #888888',
            letterSpacing: '0.05em'
          }}
        >
          🔐 OAUTH LOGIN
        </h1>

        {user ? (
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="bg-white border-2 border-black p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={user.avatar || "/default-avatar.svg"}
                  alt="Avatar"
                  className="w-16 h-16 border-2 border-black mb-4"
                  style={{ imageRendering: 'pixelated' }}
                />
                <h3 
                  className="text-xl text-black mb-2"
                  style={{ fontFamily: "'Press Start 2P', monospace" }}
                >
                  {user.name}
                </h3>
                <p 
                  className="text-gray-700 mb-3"
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
                >
                  {user.email || "No email provided"}
                </p>
                <span
                  className={`inline-block px-3 py-1 border-2 border-black text-xs ${
                    user.provider === "google"
                      ? "bg-red-200"
                      : "bg-blue-200"
                  }`}
                  style={{ fontFamily: "'Press Start 2P', monospace" }}
                >
                  {user.provider.toUpperCase()}
                </span>
                {user.tag && (
                  <p 
                    className="text-sm text-gray-600 mt-2"
                    style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px' }}
                  >
                    {user.tag}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/success'}
                className="w-full px-4 py-3 bg-yellow-300 border-2 border-black text-black hover:bg-yellow-400 transition-colors"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
              >
                🏆 SUCCESS PAGE
              </button>
              
              <button
                onClick={handleViewProfile}
                className="w-full px-4 py-3 bg-green-300 border-2 border-black text-black hover:bg-green-400 transition-colors"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
              >
                📊 VIEW PROFILE
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-red-300 border-2 border-black text-black hover:bg-red-400 transition-colors"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
              >
                🚪 LOGOUT
              </button>

              {/* Logout Menu Toggle */}
              <div className="relative logout-menu-container">
                <button
                  onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                  className="w-full px-4 py-3 bg-orange-300 border-2 border-black text-black hover:bg-orange-400 transition-colors"
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
                >
                  ⚙️ LOGOUT OPTIONS {showLogoutMenu ? '▲' : '▼'}
                </button>

                {/* Logout Dropdown Menu */}
                {showLogoutMenu && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border-2 border-black shadow-lg z-20">
                    <button
                      onClick={handleQuickLogout}
                      className="w-full px-4 py-2 text-left bg-yellow-200 hover:bg-yellow-300 border-b border-black transition-colors"
                            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px' }}
                          >
                            ⚡ QUICK LOGOUT
                          </button>
                          <button
                            onClick={handleAdvancedLogout}
                            className="w-full px-4 py-2 text-left bg-purple-200 hover:bg-purple-300 transition-colors"
                            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px' }}
                          >
                            🔒 ADVANCED OPTIONS
                          </button>
                          </div>
                        )}
                        </div>
                      </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                      <p 
                        className="text-center text-black mb-6"
                        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
                      >
                        Choose your authentication provider:
                      </p>

                      <div className="space-y-3">
                        <button
                        onClick={() => handleLogin("google")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-300 border-2 border-black text-black hover:bg-red-400 transition-colors"
                        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
                        >
                        <img
                          src="https://www.svgrepo.com/show/475656/google-color.svg"
                          alt="Google"
                          className="w-5 h-5"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        GOOGLE LOGIN
                        </button>

                        <button
                        onClick={() => handleLogin("discord")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-300 border-2 border-black text-black hover:bg-blue-400 transition-colors"
                        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
                        >
                        <img
                          src="https://www.svgrepo.com/show/353655/discord-icon.svg"
                          alt="Discord"
                          className="w-5 h-5"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        DISCORD LOGIN
                        </button>
                      </div>
                      </div>
                    )}
        <div className="mt-8 pt-6 border-t-2 border-black">
          <p 
            className="text-center text-xs text-gray-600"
            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px' }}
          >
            Powered by Next.js + RetroUI
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
