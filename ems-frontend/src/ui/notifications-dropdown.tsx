import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from './button';
import { api } from '../lib/api';
import { Notification, PageResponse } from '../lib/types';
import { cn } from '../lib/cn';

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<PageResponse<Notification>>('/api/notifications?page=0&size=20');
      setNotifications(res.data.items);
      setUnreadCount(res.data.items.filter(n => !n.read).length);
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      await fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Check every 30 seconds since we don't need real-time
    const timer = setInterval(fetchNotifications, 30000);
    
    const onWsNotif = () => fetchNotifications();
    window.addEventListener("ws:notification", onWsNotif);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener("ws:notification", onWsNotif);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" className="px-2 relative" onClick={() => setOpen(!open)} title="Notifications">
        <Bell size={20} className="text-slate-700 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-2 inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-fade-in origin-top-right">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" className="h-auto py-1 px-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" onClick={markAllAsRead}>
                <Check size={14} className="mr-1 inline" /> Mark all read
              </Button>
            )}
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center">
                <Bell size={24} className="mb-2 opacity-20" />
                No notifications right now
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {notifications.map((notif) => (
                  <div key={notif.id} className={cn("px-4 py-3 text-sm transition-colors duration-150", notif.read ? "opacity-75" : "bg-blue-50/50 dark:bg-blue-900/10")}>
                    <div className="flex items-start gap-3">
                      {!notif.read && <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-slate-800 dark:text-slate-200", !notif.read && "font-medium")}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
