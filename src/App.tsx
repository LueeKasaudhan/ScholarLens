import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { OpportunityDetail } from './pages/OpportunityDetail';
import { Bookmarks } from './pages/Bookmarks';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <ThemeProvider>
      <BookmarkProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#141312] text-stone-900 dark:text-stone-100 transition-colors duration-200 epoch-canvas">
            {/* Navigation Header */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/opportunity/:id" element={<OpportunityDetail />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Curated Editorial Footer in Minimal Epoch Style */}
            <footer className="border-t border-dashed border-stone-300 dark:border-stone-800 bg-[#faf8f5]/80 dark:bg-[#141312]/80 backdrop-blur-xs py-7 px-4 sm:px-6 lg:px-9 text-xs text-stone-500 dark:text-stone-400">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                  <span className="font-serif-title text-base font-normal text-stone-900 dark:text-stone-200">
                    scholar<span className="font-sans font-bold text-sm">Lens</span>
                  </span>
                  <span className="hidden sm:inline font-mono">/</span>
                  <span className="font-sans text-[12.5px]">Curated long-tail tech scholarships &amp; fellowships for Indian graduates</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-stone-400">
                  <span>Golden Hour · Twilight · Starlit Ambience</span>
                </div>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </BookmarkProvider>
    </ThemeProvider>
  );
}
