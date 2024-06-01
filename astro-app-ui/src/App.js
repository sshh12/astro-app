import { lazy, Suspense } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

const Onboarding = lazy(() => import("./pages/Onboarding"));

function App() {
  const location = useLocation();
  return (
    <Suspense fallback={<>Loading...</>}>
      <Routes key={location.pathname} location={location}>
        <Route path="/" element={<Onboarding />} />
        <Route path={`*`} element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
