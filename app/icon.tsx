import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** App icon / favicon — Farm OS / SPX Africa spiral mark */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2a7a4b",
          borderRadius: 7,
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.5 27c3.5-1.7 7.4-2.5 11.5-2.5S24 25.3 27.5 27"
            stroke="white"
            strokeOpacity="0.38"
            strokeWidth="1.55"
            strokeLinecap="round"
          />
          <path
            d="M16 24.8V17.2"
            stroke="white"
            strokeOpacity="0.5"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <path
            d="M16 17.1c1.55 0 2.75-1.2 2.75-2.65 0-2.15-1.8-3.85-4.05-3.85-2.95 0-5.2 2.45-5.2 5.45 0 3.85 3.2 6.85 7.15 6.85 4.7 0 8.35-3.75 8.35-8.45 0-5.55-4.55-9.95-10.15-9.95-1.35 0-2.65.25-3.85.7"
            stroke="white"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.2 4.55c1.05.15 1.95.7 2.55 1.5.25.35-.05.8-.45.7-1-.25-1.85-.85-2.4-1.7-.2-.35.1-.6.3-.5Z"
            fill="white"
          />
          <circle cx="16" cy="14.45" r="1.25" fill="white" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
