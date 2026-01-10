import React, { useState } from "react";
import classNames from "classnames";
import { useUserContext } from "providers/user_provider";
import {
  useGetNotifications,
  useGetUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  Notification,
} from "api/notifications";
import { useNavigate } from "react-router-dom";

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onNavigate: (link: string) => void;
}> = ({ notification, onMarkAsRead, onNavigate }) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      onNavigate(notification.link);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={classNames(
        "w-full text-left px-4 py-3 sm:px-3 sm:py-3 transition-all border-b border-border-default last:border-b-0 active:scale-[0.99]",
        notification.read
          ? "bg-transparent hover:bg-surface-hover active:bg-surface-hover"
          : "bg-primary/5 hover:bg-primary/10 active:bg-primary/10"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={classNames(
            "w-2 h-2 rounded-full mt-2 flex-shrink-0",
            notification.read ? "bg-transparent" : "bg-primary"
          )}
        />
        <div className="flex-1 min-w-0">
          <p
            className={classNames(
              "text-sm sm:text-sm font-medium line-clamp-2 sm:truncate",
              notification.read ? "text-text-secondary" : "text-text-primary"
            )}
          >
            {notification.title}
          </p>
          <p className="text-xs text-text-tertiary mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-text-muted mt-1.5">
            {formatTimeAgo(notification.created_at)}
          </p>
        </div>
      </div>
    </button>
  );
};

export const NotificationCenter: React.FC = () => {
  const { user } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { data: notifications = [] } = useGetNotifications(user?.id);
  const { data: unreadCount = 0 } = useGetUnreadCount(user?.id);
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const handleMarkAsRead = (id: string) => {
    markAsRead({ id });
  };

  const handleNavigate = (link: string) => {
    setIsOpen(false);
    if (link.startsWith("/")) {
      navigate(link);
    } else {
      window.open(link, "_blank");
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface hover:bg-surface-hover border border-border-default hover:border-border-hover text-text-secondary hover:text-text-primary transition-all active:scale-95"
        aria-label="Notifications"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-primary rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10 bg-black/20 sm:bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 max-w-md sm:w-96 rounded-2xl bg-bg-tertiary border border-border-default shadow-primary-lg z-20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
              <h3 className="font-semibold text-text-primary">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary hover:text-primary-light transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-hover transition-colors"
                  aria-label="Close notifications"
                >
                  <svg
                    className="w-5 h-5 text-text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <svg
                    className="w-12 h-12 mx-auto text-text-muted mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <p className="text-text-tertiary text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onNavigate={handleNavigate}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
