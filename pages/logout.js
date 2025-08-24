import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Logout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Add pixel font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Check for logout message from URL params
    if (router.query.message === 'logged_out') {
      setMessage("You have been logged out successfully!");
    } else if (router.query.error === 'logout_failed') {
      setMessage("Logout failed. Please try again.");
    } else if (router.query.message === 'already_logged_out') {
      setMessage("You were already logged out.");
    }
  }, [router.query]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setMessage("Logout successful! Redirecting...");
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setMessage("Logout failed. Please try again.");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Network error. Trying alternative method...");
      // Fallback to GET logout
      setTimeout(() => {
        window.location.href = "/auth/logout";
      }, 1500);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <>
      <Head>
        <title>Logout - Retro OAuth</title>
        <meta name="description" content="Logout confirmation page" />
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
        <div className="relative z-10 text-center space-y-8 max-w-md">
          {/* Logout Icon */}
          <div className="text-6xl mb-6 animate-bounce">
            🚪
          </div>

          {/* Title */}
          <h1 
            className="text-4xl md:text-5xl text-black mb-6"
            style={{ 
              fontFamily: "'Press Start 2P', monospace",
              textShadow: '2px 2px 0px #888888',
              letterSpacing: '0.1em'
            }}
          >
            {message ? "LOGOUT STATUS" : "CONFIRM LOGOUT"}
          </h1>

          {/* Message or Confirmation */}
          <div className="bg-gray-100 border-4 border-black p-6 mb-6">
            {message ? (
              <div>
                <p 
                  className="text-black mb-4"
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }}
                >
                  {message}
                </p>
                
                {!isLoggingOut && !message.includes("successful") && (
                  <button
                    onClick={handleGoHome}
                    className="px-6 py-3 bg-blue-300 border-2 border-black text-black hover:bg-blue-400 transition-colors"
                    style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
                  >
                    GO HOME
                  </button>
                )}
              </div>
            ) : (
              <div>
                <p 
                  className="text-black mb-6"
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px' }}
                >
                  Are you sure you want to logout?
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleConfirmLogout}
                    disabled={isLoggingOut}
                    className={`px-6 py-3 border-2 border-black text-black transition-colors ${
                      isLoggingOut 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-red-300 hover:bg-red-400'
                    }`}
                    style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}
                  >
                    {isLoggingOut ? 'LOGGING OUT...' : 'YES, LOGOUT'}
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
            )}
          </div>

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
