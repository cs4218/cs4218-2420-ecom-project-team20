import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { Outlet, Navigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner";
import React from "react";

export default function PrivateRoute() {
  const [ok, setOk] = useState(false);
  const [auth, setAuth] = useAuth();
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const authCheck = async () => {
      try {
        const res = await axios.get("/api/v1/auth/user-auth");
        if (res.data.ok) {
          setOk(true);
        } else {
          setOk(false);
        }
      } catch (err) {
        // Catch network or other errors and handle them
        setError(err.message || "Something went wrong.");
        setOk(false); // Optionally, you can set ok to false if the user isn't authenticated
      } finally {
        setLoading(false); // Stop loading once the request is finished
      }
    };

    if (auth?.token) {
      authCheck();
    } else {
      setLoading(false); // No token case, stop loading immediately
    }
  }, [auth?.token]);

  if (loading) {
    return <Spinner path="" />; // Show loading spinner while waiting for the result
  }

  if (error) {
    return <div>Error: {error}</div>; // Show error message if there is a network error
  }

  return ok ? (
    <Outlet data-testid="outlet" />
  ) : (
    <Navigate to="/login" replace />
  );
}
