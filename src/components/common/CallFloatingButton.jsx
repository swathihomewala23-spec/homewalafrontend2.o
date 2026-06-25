import React from "react";
import "./CallFloatingButton.css";

export default function CallFloatingButton({
  phone = "918925997080",
  position = "bottom-right",
  size = 41,
}) {
  const href = `tel:+${phone}`;

  const posClass = {
    "bottom-right": "call-float--bottom-right",
    "bottom-left": "call-float--bottom-left",
    "top-right": "call-float--top-right",
    "top-left": "call-float--top-left",
  }[position];

  return (
    <div className={`call-float ${posClass}`}>
      <a href={href} aria-label="Call Now" className="call-float__button" style={{ width: `${size}px`, height: `${size}px` }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" width={size * 0.55} height={size * 0.55} aria-hidden="true">
          <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.72 11.72 0 003.68.59 1 1 0 011 1v3.5a1 1 0 01-1 1A17.91 17.91 0 012 6a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.01l-2.23 2.1z" />
        </svg>
      </a>
    </div>
  );
}
