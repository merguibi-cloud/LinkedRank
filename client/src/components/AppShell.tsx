import Navbar from "@/components/Navbar";
import { NAVBAR_OFFSET_CLASS, shouldShowNavbar } from "@/lib/navigation";
import { useLocation } from "wouter";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const showNavbar = shouldShowNavbar(location);

  return (
    <>
      {showNavbar && <Navbar />}
      <div className={showNavbar ? NAVBAR_OFFSET_CLASS : undefined}>{children}</div>
    </>
  );
}
