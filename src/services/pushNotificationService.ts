import { AppNotification, PushNotificationType, PushPreferences } from '../types';

const STORAGE_KEY_NOTIFICATIONS = 'la_pantera_notifications';
const STORAGE_KEY_PREFERENCES = 'la_pantera_push_preferences';
const STORAGE_KEY_FCM_TOKEN = 'la_pantera_fcm_token';

const DEFAULT_PREFERENCES: PushPreferences = {
  bookingConfirmations: true,
  turnReminders: true,
  tournamentUpdates: true,
  classAvailability: true,
  waitlistAlerts: true,
  soundEnabled: true,
};

// Play an energetic audio beep/chime using AudioContext for sports notification
const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Synth chime: dual tone magenta ping
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.18); // D6

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.35);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (err) {
    // Audio context may be restricted by autoplay policy before user gesture
  }
};

export class PushNotificationService {
  private static listeners: Array<(notifications: AppNotification[]) => void> = [];

  // Register service worker if available
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        return registration;
      } catch (error) {
        console.warn('Service Worker registration skipped or failed:', error);
      }
    }
    return null;
  }

  // Request browser permission
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Generate or simulate FCM / WebPush token
        this.generatePushToken();
        await this.registerServiceWorker();
        this.dispatchNotification({
          type: 'booking_confirmation',
          title: '¡Notificaciones Activadas! 🎾',
          body: 'Recibirás avisos de turnos, listas de espera y novedades de torneos de La Pantera Padel.',
        });
      }
      return permission;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  static getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  static getPushToken(): string | null {
    return localStorage.getItem(STORAGE_KEY_FCM_TOKEN);
  }

  private static generatePushToken(): string {
    let token = localStorage.getItem(STORAGE_KEY_FCM_TOKEN);
    if (!token) {
      token = 'fcm_pantera_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      localStorage.setItem(STORAGE_KEY_FCM_TOKEN, token);
    }
    return token;
  }

  static getPreferences(): PushPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFERENCES);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  static savePreferences(prefs: PushPreferences) {
    localStorage.setItem(STORAGE_KEY_PREFERENCES, JSON.stringify(prefs));
  }

  static getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static markAsRead(id: string) {
    const list = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(list));
    this.notifyListeners(list);
  }

  static markAllAsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(list));
    this.notifyListeners(list);
  }

  static clearAll() {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify([]));
    this.notifyListeners([]);
  }

  static subscribe(listener: (notifications: AppNotification[]) => void) {
    this.listeners.push(listener);
    listener(this.getNotifications());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners(list: AppNotification[]) {
    this.listeners.forEach(fn => fn(list));
  }

  // Core Dispatcher
  static async dispatchNotification(params: {
    type: PushNotificationType;
    title: string;
    body: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
  }): Promise<AppNotification> {
    const preferences = this.getPreferences();

    // Check preference by type
    if (params.type === 'booking_confirmation' && !preferences.bookingConfirmations) return {} as any;
    if (params.type === 'turn_reminder' && !preferences.turnReminders) return {} as any;
    if (params.type === 'tournament_update' && !preferences.tournamentUpdates) return {} as any;
    if (params.type === 'class_available' && !preferences.classAvailability) return {} as any;
    if (params.type === 'waitlist_freed' && !preferences.waitlistAlerts) return {} as any;

    const newNotification: AppNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type: params.type,
      title: params.title,
      body: params.body,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      actionUrl: params.actionUrl || '#reservas',
      metadata: params.metadata,
    };

    // Save to local storage
    const currentList = this.getNotifications();
    const updatedList = [newNotification, ...currentList].slice(0, 30);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updatedList));
    this.notifyListeners(updatedList);

    // Audio chime
    if (preferences.soundEnabled) {
      playNotificationChime();
    }

    // Native Browser Web Push Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(params.title, {
              body: params.body,
              icon: '/assets/aistudio/Screenshot_2026-10-20_153810_4d29d437.png',
              badge: '/assets/aistudio/Screenshot_2026-10-20_153810_4d29d437.png',
              vibrate: [150, 80, 150],
              data: { url: params.actionUrl || '/' },
            } as any);
          });
        } else {
          new Notification(params.title, {
            body: params.body,
            icon: '/assets/aistudio/Screenshot_2026-10-20_153810_4d29d437.png',
          });
        }
      } catch (err) {
        console.warn('Native notification display error:', err);
      }
    }

    return newNotification;
  }

  // Pre-configured notification triggers
  static notifyBookingConfirmed(courtName: string, date: string, timeSlot: string) {
    return this.dispatchNotification({
      type: 'booking_confirmation',
      title: '¡Turno Confirmado en La Pantera! 🐾',
      body: `${courtName} reservada para el ${date} a las ${timeSlot}. ¡A calentar la muñeca!`,
      actionUrl: '#mis-turnos',
    });
  }

  static notifyTurnReminder(courtName: string, timeSlot: string) {
    return this.dispatchNotification({
      type: 'turn_reminder',
      title: '⏰ Recordatorio de Partido',
      body: `Faltan 2 horas para tu turno en ${courtName} (${timeSlot}). Te esperamos en Jovita.`,
      actionUrl: '#mis-turnos',
    });
  }

  static notifyTournamentUpdate(tournamentName: string, detail: string) {
    return this.dispatchNotification({
      type: 'tournament_update',
      title: `🏆 ${tournamentName}`,
      body: detail,
      actionUrl: '#torneos',
    });
  }

  static notifyClassAvailable(coachName: string, date: string, time: string) {
    return this.dispatchNotification({
      type: 'class_available',
      title: `🎾 Nuevo cupo en Academia`,
      body: `${coachName} abrió disponibilidad el ${date} a las ${time}. Agéndala antes de que se agote.`,
      actionUrl: '#academia',
    });
  }

  static notifyWaitlistFreed(courtName: string, date: string, timeSlot: string) {
    return this.dispatchNotification({
      type: 'waitlist_freed',
      title: '⚡ ¡TURNO LIBERADO!',
      body: `Se acaba de dar de baja el turno de las ${timeSlot} en ${courtName} (${date}). ¡Toca aquí para reservarlo ya!`,
      actionUrl: '#reservas',
    });
  }
}
