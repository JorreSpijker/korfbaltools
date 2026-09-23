// Het merkteken staat in deze app altijd op de navy balk. De diepe accentoranje
// (#C2410C) haalt daar 2,3:1 en zakt daarmee onder de 3:1 die WCAG voor
// grafische elementen vraagt, dus op navy gebruiken we de lichte stap.
export const LOGO_ORANJE_OP_NAVY = "#F9B06E";
/** Voor het merkteken op een lichte of transparante ondergrond (favicon). */
export const LOGO_ORANJE = "#C2410C";

export interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={{ fillRule: "evenodd", clipRule: "evenodd", strokeLinejoin: "round", strokeMiterlimit: 2 }}
    >
      <path
        d="M195.501 175.5h-87.09L46.391 103V59.625L101.578.792h34.921L136.5.79H172L173.742 4v37.708h22.667v30.209H81.328l-8.25 8.187 64.624 73.843q-3.084-7.773-3.543-19.78v-52.5h39.583v51.291q.851 9.627 11.209 10.354l10.25.25 1.708 1.584.104 28.75zM134.034 19.613l-22.265 22.095h22.265zM40.911.792V175.5H.578V.792z"
        style={{ fill: LOGO_ORANJE_OP_NAVY }}
        transform="matrix(.91877 0 0 .82398 6.878 22.64)"
      />
    </svg>
  );
}
