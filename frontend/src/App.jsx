import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import CreateReport from "./pages/CreateReport";
import Explorer from "./pages/Explorer";
import Verify from "./pages/Verify";
import Search from "./pages/Search";
import Timeline from "./pages/Timeline";

function NavLink({ to, children, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`
        relative px-4 py-2.5 rounded-xl font-semibold text-sm
        transition-all duration-300 flex items-center gap-2
        group overflow-hidden
        ${isActive 
          ? 'text-white bg-gradient-primary shadow-button scale-105' 
          : 'text-dark-300 hover:text-neon-cyan hover:bg-dark-800/50 hover:scale-105 hover:shadow-glow'
        }
        active:scale-95
      `}
    >
      {!isActive && (
        <span className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-neon-cyan/20 to-secondary-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
      )}
      {icon && <span className="relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-6">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-cyan/60 via-neon-cyan to-neon-cyan/60 rounded-full shadow-glow"></span>
      )}
    </Link>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-mesh bg-dark-950 animate-fade-in">
      <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-primary-800/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-glow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-extrabold gradient-text">
                  BlockWitness
                </h1>
                <p className="text-xs text-dark-400 font-medium">Tamper-Proof Evidence Recorder</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <NavLink to="/" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }>
                Create
              </NavLink>
              <NavLink to="/explorer" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }>
                Explorer
              </NavLink>
              <NavLink to="/verify" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }>
                Verify
              </NavLink>
              <NavLink to="/search" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }>
                Search
              </NavLink>
              <NavLink to="/timeline" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }>
                Timeline
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
        <Routes>
          <Route path="/" element={<CreateReport />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/search" element={<Search />} />
          <Route path="/timeline" element={<Timeline />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
