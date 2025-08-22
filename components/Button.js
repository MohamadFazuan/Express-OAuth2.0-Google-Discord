import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  type = "button",
  ...props
}) => {
  const baseClasses = "retro-btn";

  const variantClasses = {
    primary: "retro-btn-primary",
    secondary: "retro-btn-secondary",
    google: "retro-btn-google",
    discord: "retro-btn-discord",
    logout: "retro-btn-logout",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
