import Head from "next/head";
import { useState, useEffect } from "react";

const AnimatedSpider = ({ delay = 0 }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        const newX = prev.x + direction.x * 2;
        const newY = prev.y + direction.y * 1.5;
        
        // Bounce off walls
        const newDirection = { ...direction };
        if (newX > 200 || newX < -200) newDirection.x *= -1;
        if (newY > 100 || newY < -100) newDirection.y *= -1;
        setDirection(newDirection);
        
        return {
          x: Math.max(-200, Math.min(200, newX)),
          y: Math.max(-100, Math.min(100, newY))
        };
      });
    }, 50 + delay * 10);

    return () => clearInterval(interval);
  }, [direction, delay]);

  return (
    <div 
      className="absolute text-4xl animate-bounce"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.05s linear',
        animationDelay: `${delay * 0.5}s`
      }}
    >
      🕷️
    </div>
  );
};

export default function Success() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add pixel font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Check auth status
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
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleLogout = () => {
    // Navigate to logout confirmation page
    window.location.href = '/logout';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-mono">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Login Success - Pixelated Adventure</title>
        <meta name="description" content="Successfully logged in!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      
      <div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Animated Spiders */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatedSpider delay={0} />
            <AnimatedSpider delay={1} />
            <AnimatedSpider delay={2} />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center space-y-8 max-w-2xl">
          {/* Success Title */}
          <h1 
            className="text-6xl md:text-8xl text-black mb-8 animate-pulse"
            style={{ 
              fontFamily: "'Press Start 2P', monospace",
              textShadow: '4px 4px 0px #888888, 8px 8px 0px #cccccc',
              letterSpacing: '0.1em'
            }}
          >
            SUCCESS!
          </h1>

          {/* User Info */}
          {user && (
            <div className="bg-gray-100 border-4 border-black p-6 rounded-none shadow-lg">
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={user.avatar || "/default-avatar.svg"}
                  alt="User Avatar"
                  className="w-24 h-24 border-4 border-black"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="text-center">
                  <h2 
                    className="text-xl text-black mb-2"
                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                  >
                    Welcome, {user.name}!
                  </h2>
                  <p 
                    className="text-sm text-gray-700"
                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                  >
                    {user.email || "Logged in via " + user.provider}
                  </p>
                  <span 
                    className={`inline-block mt-2 px-4 py-2 border-2 border-black text-xs ${
                      user.provider === "google" 
                        ? "bg-red-200" 
                        : "bg-blue-200"
                    }`}
                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                  >
                    {user.provider.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBackToHome}
              className="px-8 py-4 bg-green-400 border-4 border-black text-black hover:bg-green-300 transition-colors"
              style={{ 
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '12px'
              }}
            >
              BACK TO HOME
            </button>
            
            <button
              onClick={handleLogout}
              className="px-8 py-4 bg-red-400 border-4 border-black text-black hover:bg-red-300 transition-colors"
              style={{ 
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '12px'
              }}
            >
              LOGOUT
            </button>
          </div>

          {/* Achievement Badge */}
          <div className="mt-8">
            <div 
              className="inline-block bg-yellow-300 border-4 border-black px-6 py-3 animate-bounce"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              🏆 ACHIEVEMENT UNLOCKED: LOGGED IN!
            </div>
          </div>
        </div>

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
      </div>
    </>
  );
}
