import { Logo } from "./logo";
import { Container } from "./container";
import { NavShape } from "./nav-shape";

export function Footer() {
  return (
    <footer className="bg-primary-500 mt-auto text-white text-sm flex justify-center items-center gap-2 relative">
      <div className="absolute top-0 left-0 -translate-y-[100%]" >
        <NavShape flipVertical />
      </div>
      <div className="absolute top-0 right-0 -translate-y-[100%]" >
        <NavShape flipVertical flipHorizontal />
      </div>
      <Container>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Logo size={40} />
            <div className="flex flex-col text-xs leading-3 text-secondary text-lg font-semibold">
              <span>Korfbal</span>
              <span>Tools.nl</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-center">
            <a href="/privacy" className="hover:underline">Privacybeleid</a>
            <a href="/terms" className="hover:underline">Algemene voorwaarden</a>
          </div>
        </div>
        <span className="text-xs text-center sm:text-left text-secondary w-full">© 2026 Korfbaltools.nl</span>
      </Container>
      <NavShape />
    </footer>
  );
}
