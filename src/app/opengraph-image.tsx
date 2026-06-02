import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Jus Wellness — Fresh Cold-Pressed Juices in Accra";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#234a38",
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(91,171,128,0.3), transparent 60%), radial-gradient(circle at 80% 20%, rgba(232,168,56,0.15), transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "2px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            J
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            Jus Wellness
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "rgba(255,255,255,0.6)",
              maxWidth: "600px",
              textAlign: "center",
              lineHeight: "1.4",
            }}
          >
            Fresh Cold-Pressed Juices · Made Daily in Accra
          </div>
          <div
            style={{
              display: "flex",
              gap: "32px",
              marginTop: "16px",
            }}
          >
            {["🧃 22 Flavours", "🚚 Same-Day Delivery", "💚 No Additives"].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    fontSize: "20px",
                    color: "rgba(255,255,255,0.5)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    padding: "8px 20px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
