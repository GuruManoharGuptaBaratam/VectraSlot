import { useSyncExternalStore } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import { getAuthToken, subscribeToAuthChanges } from "./utils/authStorage";

function App() {
    const isAuthenticated = useSyncExternalStore(
        subscribeToAuthChanges,
        () => Boolean(getAuthToken()),
        () => false,
    );

    return (
        <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
            />
            <Route path="/signup" element={<SignupPage />} />
            <Route
                path="/dashboard"
                element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
            />
            <Route
                path="*"
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
            />
        </Routes>
    );
}

export default App;
