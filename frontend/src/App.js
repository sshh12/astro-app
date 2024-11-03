import { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoadingBackground from "./components/LoadingBackground";
import { PythonContext, usePythonControl } from "./contexts/python";
import { UserProvider } from "./contexts/user";
import { routes } from "./routes";

function AppProviders({ children }) {
  const pythonControl = usePythonControl();

  return (
    <PythonContext.Provider value={pythonControl}>
      <UserProvider>{children}</UserProvider>
    </PythonContext.Provider>
  );
}

function App() {
  const location = useLocation();

  return (
    <Routes key={location.pathname} location={location}>
      {Object.values(routes).map(({ path, Component }) => (
        <Route
          key={path}
          path={path}
          element={
            <Suspense fallback={<LoadingBackground />}>
              <Component />
            </Suspense>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="/sky" replace />} />
    </Routes>
  );
}

function AppWrapper() {
  return (
    <AppProviders>
      <App />
    </AppProviders>
  );
}

export default AppWrapper;
