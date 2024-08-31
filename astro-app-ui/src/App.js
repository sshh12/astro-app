import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoadingBackground from "./components/LoadingBackground";
import { BackendContext, useBackendControl } from "./providers/backend";
import { PythonContext, usePythonControl } from "./providers/python";
import { StorageContext, useStorageControl } from "./providers/storage";

const SkyPage = lazy(() => import("./pages/SkyPage"));
const SkyListPage = lazy(() => import("./pages/SkyListPage"));
const SkyObjectPage = lazy(() => import("./pages/SkyObjectPage"));
const SkySearchPage = lazy(() => import("./pages/SkySearchPage"));
const ImageAnalyzePage = lazy(() => import("./pages/ImageAnalyzePage"));
const ImageEquipmentPage = lazy(() => import("./pages/ImageEquipmentPage"));
const ImageImagePage = lazy(() => import("./pages/ImageImagePage"));
const ImageNinaPage = lazy(() => import("./pages/ImageNinaPage"));
const LocationWeatherPage = lazy(() => import("./pages/LocationWeatherPage"));
const LocationPollutionPage = lazy(() =>
  import("./pages/LocationPollutionPage")
);
const LocationEventsPage = lazy(() => import("./pages/LocationEventsPage"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

function App() {
  const location = useLocation();
  const backendControl = useBackendControl();
  const pythonControl = usePythonControl();
  return (
    <BackendContext.Provider value={backendControl}>
      <PythonContext.Provider value={pythonControl}>
        <Routes key={location.pathname} location={location}>
          <Route path="/sky" element={<SkyPage />} />
          <Route path="/sky/list/:id" element={<SkyListPage />} />
          <Route path="/sky/object/:id" element={<SkyObjectPage />} />
          <Route path="/sky/search" element={<SkySearchPage />} />
          <Route path="/image/analyze" element={<ImageAnalyzePage />} />
          <Route path="/image/images/:id" element={<ImageImagePage />} />
          <Route path="/image/equipment" element={<ImageEquipmentPage />} />
          <Route path="/image/nina" element={<ImageNinaPage />} />
          <Route path="/location/weather" element={<LocationWeatherPage />} />
          <Route
            path="/location/pollution"
            element={<LocationPollutionPage />}
          />
          <Route path="/location/events" element={<LocationEventsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
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
