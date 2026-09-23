import { cn } from "./cn";
import { Logo } from "./logo";
import { NavShape } from "./nav-shape";

export interface FooterProps {
  containerClassName?: string;
}

export function Footer({ containerClassName }: FooterProps = {}) {
  return (
    <footer className="bg-primary-500 mt-auto text-white text-sm flex justify-center items-center gap-2 relative">
      <div className="absolute top-0 left-0 -translate-y-[100%]" >
        <NavShape flipVertical />
      </div>
      <div className="absolute top-0 right-0 -translate-y-[100%]" >
        <NavShape flipVertical flipHorizontal />
      </div>
      <div className={cn("mx-auto w-full flex max-w-4xl flex-col items-start gap-3 px-6 py-8", containerClassName)}>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Logo size={40} />
            <div className="flex flex-col text-xs leading-3 text-secondary-300 text-lg font-semibold">
              <span>Korfbal</span>
              <span>Tools.nl</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-center">
            <a href="/privacy" className="hover:underline">Privacybeleid</a>
          </div>
        </div>
        <span className="text-xs text-center sm:text-left text-secondary-300 w-full">© 2026 Korfbaltools.nl</span>
      </div>
      <NavShape />
    </footer>
  );
}
