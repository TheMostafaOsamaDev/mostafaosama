import React from "react";

function Warning() {
  return (
    <svg
      className="with-icon_icon__aLCKg"
      data-testid="geist-icon"
      fill="none"
      height="24"
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="24"
      style={{
        color: "var(--geist-foreground)",
        width: "24px",
        height: "24px",
      }}
    >
      <path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0"
        fill="var(--geist-fill)"
      />
      <path d="M12 9v4" stroke="var(--geist-stroke)" />
      <path d="M12 17h.01" stroke="var(--geist-stroke)" />
    </svg>
  );
}

export default Warning;
