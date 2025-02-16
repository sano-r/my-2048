import { ReactNode } from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant: keyof typeof buttonStyle;
};

const buttonStyle = {
  green:
    "bg-green-500 text-white hover:bg-green-700 transition-colors duration-300",
  blue: "bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-300",
  red: "bg-red-500 text-white hover:bg-red-700 transition-colors duration-300",
  "red-gradation":
    "bg-gradation-to-r from-red-300 to-red-600 text-white hover:from-red-600 hover:to-red-300",
};

export function Button({ children, variant, className, ...props }: Props) {
  return (
    <button
      className={`px-4 py-2 rounded ${buttonStyle[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
