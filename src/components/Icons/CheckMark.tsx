import React from "react";

function CheckMark() {
  return (
    <svg
      className="with-icon_icon__aLCKg"
      data-testid="geist-icon"
      fill="none"
      height={24}
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width={24}
      style={{
        color: "var(--geist-foreground)",
        width: "24px",
        height: "24px",
      }}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default CheckMark;
