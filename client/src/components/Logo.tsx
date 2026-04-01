interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Building body with gabled roofline */}
      <path d="M4 28V8l12-4 12 4v20H4z" fill="currentColor" />
      {/* Brass roof accent line */}
      <path
        d="M4 8l12-4 12 4"
        stroke="hsl(42 50% 70%)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Arched doorway cutout */}
      <path
        d="M12 28v-10a4 4 0 0 1 8 0v10"
        style={{ fill: "hsl(var(--background))" }}
      />
      {/* Window pair */}
      <rect
        x="8"
        y="12"
        width="4"
        height="4"
        rx="0.5"
        style={{ fill: "hsl(var(--background))" }}
        opacity="0.85"
      />
      <rect
        x="20"
        y="12"
        width="4"
        height="4"
        rx="0.5"
        style={{ fill: "hsl(var(--background))" }}
        opacity="0.85"
      />
    </svg>
  );
}
