import { lazy, Suspense } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import LoadingBackground from "./components/LoadingBackground";
import { StorageContext, useStorageControl } from "./providers/storage";
import { BackendContext, useBackendControl } from "./providers/backend";
import { PythonContext, usePythonControl } from "./providers/python";

const SkyPage = lazy(() => import("./pages/SkyPage"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

function App() {
  const location = useLocation();
  const backendControl = useBackendControl();
  const pythonControl = usePythonControl();
  return (
    <BackendContext.Provider value={backendControl}>
      <PythonContext.Provider value={pythonControl}>
        <Routes key={location.pathname} location={location}>
          <Route path="/sky" element={<SkyPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path={`*`} element={<Navigate to="/sky" replace />} />
        </Routes>
      </PythonContext.Provider>
    </BackendContext.Provider>
  );
}

function AppWrapper() {
  const storageControl = useStorageControl();
  return (
    <Suspense fallback={<LoadingBackground />}>
      <StorageContext.Provider value={storageControl}>
        <App />
      </StorageContext.Provider>
    </Suspense>
  );
}

export default AppWrapper;
