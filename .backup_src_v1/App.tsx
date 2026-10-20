import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { DemoDataBanner } from './components/DemoDataBanner';
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
          <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200 slice-of-life-canvas">
            {/* Informational Demo Data Banner */}
            <DemoDataBanner />

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

            {/* Curated Editorial Footer with warm slice-of-life atmosphere */}
            <footer className="border-t border-amber-200/50 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 backdrop-blur-xs py-8 px-4 sm:px-6 lg:px-8 text-xs text-stone-500 dark:text-stone-400">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                  <span className="font-bold text-stone-800 dark:text-stone-200">ScholarLens</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Surfacing long-tail tech scholarships and fellowships for Indian graduates</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-amber-700 dark:text-amber-400">Indus Motion Graphics &amp; Slice-of-Life Atmosphere</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span>Cosine Similarity Vector Layer</span>
                </div>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </BookmarkProvider>
    </ThemeProvider>
  );
}
