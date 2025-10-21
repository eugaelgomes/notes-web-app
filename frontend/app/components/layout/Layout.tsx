"use client";

import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { authenticated } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-neutral-950">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-950">
      <Navbar onToggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Overlay para mobile quando sidebar está aberta */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
        
        {/* Sidebar como aside em desktop */}
        <aside className={`
          fixed lg:static z-50 lg:z-auto
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:block
          w-64 h-full
          top-0 lg:top-auto left-0 lg:left-auto
          pt-16 lg:pt-0
          bg-neutral-900 lg:bg-transparent
          lg:shadow-none
          flex flex-col
        `}>
          <div className="h-full p-2 lg:p-4">
            <Sidebar onLinkClick={closeSidebar} />
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-0">
          <div className="flex-1 overflow-y-auto no-scrollbar p-4">
            <div className="max-w-full mx-auto h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}