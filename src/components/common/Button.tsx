import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary: "border border-blue-900 bg-blue-900 text-white hover:bg-blue-900",
  outline: "border-2 border-blue-900 bg-white text-blue-900 hover:bg-white",
  icon: "border-0 bg-transparent text-blue-900 hover:bg-white/70",
};

type ButtonVariant = keyof typeof variants;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl font-bold py-5 text-[16px] transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
