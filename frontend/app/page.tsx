"use client";
import { useAuth } from "./contexts/AuthContext";
import SignIn from "./auth/login/page";

export default function Home() {
  const { authenticated } = useAuth();

  // Show login if not authenticated, otherwise redirect to home
  if (!authenticated) return <SignIn />;
  
  // If authenticated, redirect to home page
  if (typeof window !== "undefined") {
    window.location.href = "/app/home";
  }
  
  return null;
}
