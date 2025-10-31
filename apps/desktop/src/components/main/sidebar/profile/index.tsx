import { useQuery } from "@tanstack/react-query";
import {
  CalendarIcon,
  ChevronUpIcon,
  FolderOpenIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { commands as windowsCommands } from "@hypr/plugin-windows";
import { Kbd, KbdGroup } from "@hypr/ui/components/ui/kbd";
import { cn } from "@hypr/utils";

import { useAuth } from "../../../../auth";
import { useAutoCloser } from "../../../../hooks/useAutoCloser";
import { useTabs } from "../../../../store/zustand/tabs";
import { AuthSection } from "./auth";
import {
  NotificationsMenuContent,
  NotificationsMenuHeader,
} from "./notification";
import { UpdateChecker } from "./ota";
import { MenuItem } from "./shared";
import { env } from "../../../../env";

type ProfileView = "main" | "notifications";

export function ProfileSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentView, setCurrentView] = useState<ProfileView>("main");
  const [mainViewHeight, setMainViewHeight] = useState<number | null>(null);
  const mainViewRef = useRef<HTMLDivElement | null>(null);
  const { openNew } = useTabs();
  const auth = useAuth();

  const isAuthenticated = !!auth?.session;
  const supabaseAvailable =
    !!env.VITE_SUPABASE_URL && !!env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const closeMenu = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const handleSignIn = useCallback(async () => {
    await auth?.signIn();
  }, [auth]);

  const handleSignOut = useCallback(async () => {
    await auth?.signOut();
    closeMenu();
  }, [auth, closeMenu]);

  useEffect(() => {
    if (!isExpanded && currentView !== "main") {
      const timer = setTimeout(() => {
        setCurrentView("main");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, currentView]);

  useEffect(() => {
    if (!isExpanded) {
      setMainViewHeight(null);
    }
  }, [isExpanded]);

  useLayoutEffect(() => {
    if (!isExpanded || currentView !== "main") {
      return;
    }

    const element = mainViewRef.current;
    if (!element) {
      return;
    }

    const updateHeight = () => {
      const height = element.getBoundingClientRect().height;
      if (height > 0) {
        setMainViewHeight(height);
      }
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isExpanded, currentView, isAuthenticated]);

  const profileRef = useAutoCloser(closeMenu, {
    esc: isExpanded,
    outside: isExpanded,
  });

  const handleClickSettings = useCallback(() => {
    windowsCommands.windowShow({ type: "settings" });
    closeMenu();
  }, [closeMenu]);

  const handleClickFolders = useCallback(() => {
    openNew({ type: "folders", id: null });
    closeMenu();
  }, [openNew, closeMenu]);

  const handleClickCalendar = useCallback(() => {
    openNew({ type: "calendars", month: new Date() });
    closeMenu();
  }, [openNew, closeMenu]);

  const handleClickContacts = useCallback(() => {
    openNew({
      type: "contacts",
      state: {
        selectedOrganization: null,
        selectedPerson: null,
      },
    });
    closeMenu();
  }, [openNew, closeMenu]);

  const handleClickNotifications = useCallback(() => {
    setCurrentView("notifications");
  }, []);

  const handleBackToMain = useCallback(() => {
    setCurrentView("main");
  }, []);

  const handleClickProfile = useCallback(() => {
    // TODO: Show the user's own profile in the contacts view
    openNew({
      type: "contacts",
      state: {
        selectedOrganization: null,
        selectedPerson: null,
      },
    });
    closeMenu();
  }, [openNew, closeMenu]);

  const menuItems = [
    { icon: FolderOpenIcon, label: "Folders", onClick: handleClickFolders },
    { icon: UsersIcon, label: "Contacts", onClick: handleClickContacts },
    { icon: CalendarIcon, label: "Calendar", onClick: handleClickCalendar },
    { icon: UserIcon, label: "My Profile", onClick: handleClickProfile },
    {
      icon: SettingsIcon,
      label: "Settings",
      onClick: handleClickSettings,
      badge: (
        <KbdGroup>
          <Kbd className="bg-neutral-200">⌘</Kbd>
          <Kbd className="bg-neutral-200">,</Kbd>
        </KbdGroup>
      ),
    },
  ];

  return (
    <div ref={profileRef} className="relative">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute bottom-full left-0 right-0 mb-1"
          >
            <div className="bg-neutral-50 rounded-lg overflow-hidden shadow-lg border">
              <div className="pt-1.5">
                <AnimatePresence mode="wait">
                  {currentView === "main" ? (
                    
                    <motion.div
                      key="main"
                      initial={{ x: 0, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      ref={mainViewRef}
                    >
                      <NotificationsMenuHeader
                        onClick={handleClickNotifications}
                      />
                      <UpdateChecker />

                      <div className="my-1.5 border-t border-neutral-100" />

                      {menuItems.map((item) => (
                        <MenuItem key={item.label} {...item} />
                      ))}

                      {supabaseAvailable && (
                        <AuthSection
                          isAuthenticated={isAuthenticated}
                          onSignIn={handleSignIn}
                          onSignOut={handleSignOut}
                        />
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="notifications"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      style={
                        mainViewHeight ? { height: mainViewHeight } : undefined
                      }
                    >
                      <NotificationsMenuContent onBack={handleBackToMain} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-neutral-50 rounded-lg overflow-hidden">
        <ProfileButton
          name={auth?.session?.user?.email}
          isExpanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
        />
      </div>
    </div>
  );
}

function ProfileButton({
  name,
  isExpanded,
  onClick,
}: {
  name?: string;
  isExpanded: boolean;
  onClick: () => void;
}) {
  const auth = useAuth();

  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const avatarUrl = await auth?.getAvatarUrl();
      return avatarUrl;
    },
  });

  return (
    <button
      className={cn(
        "flex w-full items-center gap-2.5",
        "px-4 py-2",
        "text-left",
        "transition-all duration-300",
        "hover:bg-neutral-100",
        isExpanded && "bg-neutral-50 border-t border-neutral-100"
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex size-8 flex-shrink-0 items-center justify-center",
          "overflow-hidden rounded-full",
          "border border-white/60 border-t border-neutral-400",
          "bg-gradient-to-br from-indigo-400 to-purple-500",
          "shadow-sm",
          "transition-transform duration-300"
        )}
      >
        <img
          src={profile.data ?? ""}
          alt="Profile"
          className="h-full w-full rounded-full"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm text-black truncate">
          {name ?? "User in Local Mode"}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <ChevronUpIcon
          className={cn(
            "h-4 w-4",
            "transition-transform duration-300",
            isExpanded ? "rotate-180 text-neutral-500" : "text-neutral-400"
          )}
        />
      </div>
    </button>
  );
}
