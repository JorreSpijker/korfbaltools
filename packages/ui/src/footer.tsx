import { Logo } from "./logo";
import { Container } from "./container";
import { NavShape } from "./nav-shape";

export function Footer() {
  return (
    <footer className="bg-primary-500 mt-auto text-white text-sm py-4 px-6 flex justify-center items-center gap-2 relative">
      <div className="absolute top-0 left-0 -translate-y-[100%]" >
        <NavShape flipVertical />
      </div>
      <div className="absolute top-0 right-0 -translate-y-[100%]" >
        <NavShape flipVertical flipHorizontal />
      </div>
      <Container>
        <Logo />
        <span>© 2026 Korfbaltools.nl</span>
      </Container>
      <NavShape />
    </footer>
  );
}
