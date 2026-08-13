import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Simplify from "./pages/Simplify";
import History from "./pages/History";


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ user, children }) {

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// =====================================================
// APP
// =====================================================

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // ===================================================
  // CHECK FIREBASE LOGIN STATE
  // ===================================================

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {

        console.log("Firebase user:", currentUser);

        setUser(currentUser);
        setLoading(false);

      }
    );

    return () => unsubscribe();

  }, []);


  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-950 flex items-center justify-center">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="text-slate-400 mt-4">
            Loading ReadEase AI...
          </p>

        </div>

      </div>

    );

  }


  // ===================================================
  // ROUTES
  // ===================================================

  return (

    <BrowserRouter>

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* SIMPLIFY */}

        <Route
          path="/simplify"
          element={
            <ProtectedRoute user={user}>
              <Simplify />
            </ProtectedRoute>
          }
        />


        {/* HISTORY */}

        <Route
          path="/history"
          element={
            <ProtectedRoute user={user}>
              <History />
            </ProtectedRoute>
          }
        />


        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>

  );
}


export default App;