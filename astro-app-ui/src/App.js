import { lazy, Suspense } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import LoadingBackground from "./components/LoadingBackground";

const SkyPage = lazy(() => import("./pages/SkyPage"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

function App() {
  const location = useLocation();
  return (
    <Suspense fallback={<LoadingBackground />}>
      <Routes key={location.pathname} location={location}>
        <Route path="/sky" element={<SkyPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path={`*`} element={<Navigate to="/sky" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
