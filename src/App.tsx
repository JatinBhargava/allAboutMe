import { lazy, Suspense, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { Route, Routes, useLocation } from "react-router";
import Home from "@/pages/Home";
import CursorGlow from "@/components/CursorGlow";
import RoamingCat from "@/components/RoamingCat";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/theme/ThemeProvider";
import ThemeToggle from "@/theme/ThemeToggle";
import BonfireScene from "@/theme/BonfireScene";

// The PDF viewer is heavy, so it only loads when /resume is opened.
const ResumePage = lazy(() => import("@/pages/ResumePage"));
const MagazinePage = lazy(() => import("@/pages/MagazinePage"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          <ScrollToTop />
          <ThemeToggle />
          <BonfireScene />
          <CursorGlow />
          <RoamingCat />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/trips/kodaikanal" element={<MagazinePage />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
