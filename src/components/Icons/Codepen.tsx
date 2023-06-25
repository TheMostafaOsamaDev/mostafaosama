import React from "react";

function Codepen() {
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
      <path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2z" />
      <path d="M12 22v-6.5" />
      <path d="M22 8.5l-10 7-10-7" />
      <path d="M2 15.5l10-7 10 7" />
      <path d="M12 2v6.5" />
    </svg>
  );
}

export default Codepen;
