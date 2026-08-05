https://syntra-notification.onrender.com
https://syntra-auth.onrender.com
https://syntra-goal.onrender.com
https://syntra-ai-0km8.onrender.com

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a0a2e",
      }}
    >
      <svg
        viewBox="0 0 1024 1024"
        width={512}
        height={512}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        {/* Rounded square tile */}
        <rect width="1024" height="1024" rx="220" ry="220" fill="#6B21A8" />

        {/* SYNTRA. wordmark — Bungee, white, optically centered slightly above mid */}
        <text
          x="512"
          y="570"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Bungee', sans-serif"
          fontWeight="400"
          fontSize="192"
          letterSpacing="-4"
          fill="#FFFFFF"
        >
          SYNTRA.
        </text>
      </svg>
    </div>
  ) 
}
