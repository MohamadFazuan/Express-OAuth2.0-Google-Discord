import Head from "next/head";
import { useState, useEffect } from "react";

export default function LogoutAdvanced() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutType, setLogoutType] = useState('current'); // 'current' or 'all'
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Add pixel font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Get user info
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const response = await fetch("/api/me", {
        credentials: "include",
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const endpoint = logoutType === 'all' ? '/api/logout/all' : '/auth/logout';
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(
          logoutType === 'all' 
            ? `Logged out from ${data.sessionsCleared || 1} session(s) successfully!`
            : "Logout successful!"
        );
        
        setTimeout(() => {
          window.location.href = '/';
        }, 2500);
      } else {
        setMessage("Logout failed. Please try again.");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Network error. Trying alternative method...");
      setTimeout(() => {
        window.location.href = "/auth/logout";
      }, 1500);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <>
      <Head>
        <title>Advanced Logout - Retro OAuth</title>
        <meta name="description" content="Advanced logout options" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      
      <div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Retro Grid Background */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Main Content */}
        <div className="relative z-10 text-center space-y-8 max-w-lg">
          {/* Logout Icon */}
          <div className="text-6xl mb-6 animate-bounce">
            🚪
          </div>

          {/* Title */}
          <h1 
            className="text-3xl md:text-4xl text-black mb-6"
            style={{ 
              fontFamily: "'Press Start 2P', monospace",
              textShadow: '2px 2px 0px #888888',
              letterSpacing: '0.1em'
            }}
          >
            LOGOUT OPTIONS
          </h1>

          {/* User Info */}
          {user && (
            <div className="bg-gray-100 border-4 border-black p-4 mb-6">
              <div className="flex items-center justify-center space-x-4">
                <img
                  src={user.avatar || "/default-avatar.svg"}
                  alt="User Avatar"
                  className="w-12 h-12 border-2 border-black"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div>
                  <p 
                    className="text-black text-sm"
                    style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
                  >
                    {user.name}
                  </p>
                  <p 
                    className="text-gray-600 text-xs"
                    style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px' }}
                  >
                    {user.provider.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout Options */}
          {!message ? (
            <div className="bg-gray-100 border-4 border-black p-6 mb-6">
              <p 
                className="text-black mb-6"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }}
              >
                Choose logout option:
              </p>

              {/* Logout Type Selection */}
              <div className="space-y-4 mb-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="logoutType"
                    value="current"
                    checked={logoutType === 'current'}
                    onChange={(e) => setLogoutType(e.target.value)}
                    className="w-4 h-4 border-2 border-black"
                  />
                  <span 
                    className="text-black"
                    style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
                  >
                    Logout from this device only
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="logoutType"
                    value="all"
                    checked={logoutType === 'all'}
                    onChange={(e) => setLogoutType(e.target.value)}
                    className="w-4 h-4 border-2 border-black"
                  />
                  <span 
                    className="text-black"
                    style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
                  >
                    Logout from ALL devices 🔒
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`px-6 py-3 border-2 border-black text-black transition-colors ${
                    isLoggingOut 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-red-300 hover:bg-red-400'
                  }`}
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
                >
                  {isLoggingOut ? 'LOGGING OUT...' : 'CONFIRM LOGOUT'}
                </button>
                
                <button
                  onClick={handleCancel}
                  disabled={isLoggingOut}
                  className="px-6 py-3 bg-green-300 border-2 border-black text-black hover:bg-green-400 transition-colors disabled:opacity-50"
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 border-4 border-black p-6 mb-6">
              <p 
                className="text-black mb-4"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }}
              >
                {message}
              </p>
              
              {message.includes("successful") && (
                <div className="text-2xl animate-bounce">✅</div>
              )}
            </div>
          )}

          {isLoggingOut && (
            <div className="flex justify-center">
              <div className="animate-spin text-4xl">⚙️</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
