import { cn } from "./cn";

export interface NavShapeProps {
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  className?: string;
}

export function NavShape({ flipHorizontal = false, flipVertical = false, className }: NavShapeProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      viewBox="0 0 60 60"
      className={cn(flipHorizontal && "-scale-x-100", flipVertical && "-scale-y-100", className, "h-4 w-4")}
    >
      <path d="M0 60V0h60S31.901 7.329 20.087 18.913C7.207 31.542 0 60 0 60" fill="#0E1C31"  />
    </svg>
  );
}
