import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BookingSection } from './components/BookingSection';
import { TournamentsSection } from './components/TournamentsSection';
import { AcademySection } from './components/AcademySection';
import { ClubInfoSection } from './components/ClubInfoSection';
import { Footer } from './components/Footer';
import { NotificationModal } from './components/NotificationModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PanteraAIAssistant } from './components/PanteraAIAssistant';
import { PushNotificationService } from './services/pushNotificationService';
import { StorageService } from './services/storageService';
import { AppNotification } from './types';
import { Bell, Sparkles } from 'lucide-react';

export default function App() {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isMyBookingsModalOpen, setIsMyBookingsModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(StorageService.getCurrentUser().isAdmin || false);
  const [currentSection, setCurrentSection] = useState('hero');
  const [dataRevision, setDataRevision] = useState(0);

  const handleRefreshData = () => {
    setDataRevision(prev => prev + 1);
  };

  // In-app Toast Banner for new incoming push notifications
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    // Register Service Worker on mount
    PushNotificationService.registerServiceWorker();

    // Listen to push notifications
    let initialLoad = true;
    const unsub = PushNotificationService.subscribe((list) => {
      if (initialLoad) {
        initialLoad = false;
        return;
      }
      if (list.length > 0) {
        const latest = list[0];
        setActiveToast(latest);
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 5500);
        return () => clearTimeout(timer);
      }
    });

    return () => unsub();
  }, []);

  const handleToggleAdmin = () => {
    const newState = StorageService.toggleAdminRole();
    setIsAdmin(newState);
    if (newState) {
      setIsAdminDashboardOpen(true);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col font-sans selection:bg-pink-600 selection:text-white">
      
      {/* Real-time In-App Push Toast */}
      {activeToast && (
        <div 
          onClick={() => {
            setIsNotificationModalOpen(true);
            setActiveToast(null);
          }}
          className="fixed top-24 right-4 z-50 max-w-sm w-full bg-white border-2 border-pink-500 rounded-3xl p-4 shadow-2xl flex items-start gap-3 cursor-pointer animate-in slide-in-from-top duration-300"
        >
          <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 border border-pink-200">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 pr-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-pink-600 uppercase tracking-wider">Nueva Notificación Push</span>
              <span className="text-[10px] text-zinc-400 font-mono">{activeToast.timestamp}</span>
            </div>
            <h5 className="text-xs font-black text-zinc-900 mt-0.5">{activeToast.title}</h5>
            <p className="text-[11px] text-zinc-600 mt-1 leading-snug">{activeToast.body}</p>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenMyBookings={() => setIsMyBookingsModalOpen(true)}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
        currentSection={currentSection}
        onNavigate={scrollToSection}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero
          onScrollToSection={scrollToSection}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
        />

        <BookingSection
          key={`booking-${dataRevision}`}
          onBookingSuccess={handleRefreshData}
          onOpenMyBookings={() => setIsMyBookingsModalOpen(true)}
        />

        <TournamentsSection
          refreshTrigger={dataRevision}
        />

        <AcademySection
          refreshTrigger={dataRevision}
        />

        <ClubInfoSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        onNavigate={scrollToSection}
      />

      {/* Floating Gemini AI Assistant */}
      <PanteraAIAssistant />

      {/* Modals */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onNavigateSection={scrollToSection}
      />

      <MyBookingsModal
        isOpen={isMyBookingsModalOpen}
        onClose={() => setIsMyBookingsModalOpen(false)}
        onSlotFreed={handleRefreshData}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {isAdminDashboardOpen && (
        <AdminDashboard
          onClose={() => setIsAdminDashboardOpen(false)}
          onRefreshData={handleRefreshData}
        />
      )}

    </div>
  );
}
