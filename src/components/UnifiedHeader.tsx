import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import NotificationCenter from './NotificationCenter';
import UserMenu from './UserMenu';
import styles from './UnifiedHeader.module.css';
// UnifiedHeader.tsx - Ligne 5
import AnimatedLogo from './AnimatedLogo';  // Supprimez le "from" en trop
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiTool,
  FiTruck,
  FiBox,
  FiBell,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronLeft,
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';

interface UnifiedHeaderProps {
  showUserMenu?: boolean;
  showThemeToggle?: boolean;
}

interface NavItem {
  name: string;
  path?: string;
  icon?: keyof typeof ICONS;
  children?: { name: string; path: string }[];
}

const ICONS = {
  home: FiHome,
  clients: FiUsers,
  vehicules: FiTruck,
  reparations: FiTool,
  stock: FiBox,
  settings: FiSettings,
  bell: FiBell,
  sun: FiSun,
  moon: FiMoon,
  menu: FiMenu,
  close: FiX,
  back: FiChevronLeft,
  chevrondown: FiChevronDown,
};

const NAV_ITEMS: NavItem[] = [
  { name: 'Tableau de bord', path: '/dashboard', icon: 'home' },
  {
    name: 'Clients',
    icon: 'clients',
    children: [
      { name: 'Liste des clients', path: '/clients/liste' },
      { name: 'Ajouter un client', path: '/clients/ajouter' },
      { name: 'Historique', path: '/clients/historique' },
    ],
  },
  { name: 'Véhicules', path: '/vehicules', icon: 'vehicules' },
  { name: 'Réparations', path: '/reparations', icon: 'reparations' },
  { name: 'Stock', path: '/stock', icon: 'stock' },
];

const spring = { type: 'spring', stiffness: 400, damping: 30 } as const;

const itemVariants = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
} as const;

const underlineVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: '100%', opacity: 1, transition: { duration: 0.25 } },
} as const;

const menuVariants = {
  hidden: { opacity: 0, y: -10, pointerEvents: 'none' as const },
  visible: { opacity: 1, y: 0, pointerEvents: 'auto' as const, transition: { duration: 0.2 } },
} as const;

// Styles WhatsApp constants
// Remplacez les styles WhatsApp constants existants
const whatsappHeaderStyle = `
  fixed top-0 left-0 right-0 z-50 
  w-screen min-w-full m-0 p-0
  bg-gradient-to-r from-[#128C7E] to-[#075E54]
  shadow-md
  h-25
`;

const whatsappButtonStyle = `
  p-2 rounded-full transition-all duration-300
  bg-gradient-to-br from-[#128C7E] to-[#075E54]
  text-white border-2 border-white/30
  shadow-lg hover:shadow-xl
  hover:from-[#075E54] hover:to-[#128C7E]
  active:scale-95 active:shadow-inner
  relative overflow-hidden
  h-10 w-10
  flex items-center justify-center
`;

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  showUserMenu = true,
  showThemeToggle = true,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [garageName, setGarageName] = useState<string>('Garage Abidjan');
  const [navError, setNavError] = useState<string | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);

  // Smart viewport detection
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    const media = window.matchMedia('(max-width: 767px)');
    const mediaListener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    window.addEventListener('resize', onResize);
    media.addEventListener('change', mediaListener);
    return () => {
      window.removeEventListener('resize', onResize);
      media.removeEventListener('change', mediaListener);
    };
  }, []);

  // Load garage data safely
  useEffect(() => {
    try {
      const stored = localStorage.getItem('garageData');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setGarageName(parsed.name);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Notifications count with loading state
  useEffect(() => {
    setNotifLoading(true);
    try {
      const raw = localStorage.getItem('notifications');
      if (raw) {
        const notifications = JSON.parse(raw) as { read?: boolean }[];
        setUnreadNotifications(notifications.filter((n) => !n.read).length);
      } else {
        setUnreadNotifications(0);
      }
    } catch {
      setUnreadNotifications(0);
    } finally {
      setNotifLoading(false);
    }
  }, [isNotificationOpen]);

  // Body class lock for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) document.body.classList.add('menu-open');
    else document.body.classList.remove('menu-open');
    return () => document.body.classList.remove('menu-open');
  }, [isMobileMenuOpen]);

  const isActive = (path?: string) => (path ? location.pathname === path : false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    if (location.pathname !== '/') navigate('/', { replace: true });
  };

  const ActiveUnderline: React.FC<{ active: boolean }> = ({ active }) => (
    <AnimatePresence>
      {active && (
        <motion.div
          className={styles.activeUnderline}
          initial="initial"
          animate="animate"
          exit="initial"
          variants={underlineVariants}
          layoutId="nav-underline"
        />
      )}
    </AnimatePresence>
  );

  const IconFor = (key?: keyof typeof ICONS) => {
    if (!key) return null;
    const Cmp = ICONS[key];
    return <Cmp aria-hidden className={styles.navIcon} />;
  };

  // Ripple effect utility
  const withRipple = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    const ripple = document.createElement('span');
    ripple.className = styles.ripple;
    const rect = target.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const headerClass = useMemo(() => `${styles.header} ${isDark ? styles.dark : styles.light}`, [isDark]);

  return (
    <motion.header
      className={`${whatsappHeaderStyle} ${headerClass}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={spring}
    >
      <div className="w-full h-full px-4 py-2 flex items-center justify-between">
        {/* Left: Back + Brand */}
        <div className={styles.leftSection}>



          <div className={styles.brand}>
            <div className="relative">
              {/* Bulle goutte d'eau pour le logo */}
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border-2 border-white/30 shadow-lg flex items-center justify-center water-drop">
                <AnimatedLogo />
                {/* Effet de refraction */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60 pointer-events-none"></div>
              </div>
            </div>
            <div className={styles.brandText}>
              <span className="text-white font-bold text-[2.4rem] leading-tight">{garageName}</span>
              <span className="text-white/80 text-[1.6rem] leading-tight">Excellence Automobile</span>
            </div>
          </div>
        </div>

        {/* Center: Navigation - Gardez votre navigation existante */}
        <nav className={styles.nav}>
          <ErrorBoundary onError={(msg) => setNavError(msg)}>
            <ul className={styles.navList} role="menubar">
              {NAV_ITEMS.map((item) => (
                <li key={item.name} role="none" className={styles.navItemWrapper}>
                  {item.path ? (
                    <motion.div variants={itemVariants} initial="initial" animate="animate" whileHover={{ scale: 1.05 }}>
                      <Link
                        to={item.path}
                        role="menuitem"
                        aria-current={isActive(item.path) ? 'page' : undefined}
                        className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                        onClick={withRipple}
                      >
                        {IconFor(item.icon)}
                        <span className={styles.navLabel}>{item.name}</span>
                        <ActiveUnderline active={isActive(item.path)} />
                      </Link>
                    </motion.div>
                  ) : (
                     <div 
                       className={styles.navDropdown}
                       onMouseEnter={() => setIsClientsOpen(true)}
                       onMouseLeave={() => setIsClientsOpen(false)}
                     >
                      <button
                        className={`${styles.navItem} transition-all duration-300 ease-in-out`}
                        aria-haspopup="true"
                        aria-expanded={isClientsOpen}
                        onClick={() => setIsClientsOpen((v) => !v)}
                      >
                        {IconFor(item.icon)}
                        <span className={styles.navLabel}>{item.name}</span>
                        {isClientsOpen ? <ICONS.chevrondown style={{ transform: 'rotate(180deg)' }} className={`${styles.chevron} transition-transform duration-300`} /> : <ICONS.chevrondown className={`${styles.chevron} transition-transform duration-300`} />}
                      </button>
                      <AnimatePresence>
                        {isClientsOpen && (
                          <motion.ul
                            className={`${styles.dropdownMenu} bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-600`}
                            variants={menuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                          >
                            {item.children?.map((child) => (
                              <li key={child.path} role="none">
                                <Link
                                  to={child.path}
                                  role="menuitem"
                                  className={`${styles.dropdownItem} ${isActive(child.path) ? styles.activeDropdown : ''} transition-all duration-300 ease-in-out`}
                                  onClick={(e) => {
                                    withRipple(e);
                                    setIsClientsOpen(false);
                                  }}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </ErrorBoundary>
          {navError && <span className={styles.navError} role="alert">{navError}</span>}
        </nav>

        {/* Right: Controls */}
        <div className={styles.rightSection}>
          {/* Notifications */}
          <div className={styles.badgeWrapper}>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setIsNotificationOpen(true)}
              className={whatsappButtonStyle}
            >
              <ICONS.bell className="relative z-10" />
              {!notifLoading && unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#25D366] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>
          </div>

          {/* Theme toggle */}
          {showThemeToggle && (
            <button
              type="button"
              aria-label="Changer de thème"
              onClick={(e) => {
                withRipple(e);
                toggleTheme();
              }}
              className={whatsappButtonStyle}
            >
              {isDark ? (
                <ICONS.sun className="relative z-10" />
              ) : (
                <ICONS.moon className="relative z-10" />
              )}
            </button>
          )}

          {/* User menu */}
          {showUserMenu ? (
            <UserMenu />
          ) : (
            <Button variant="ghost" size="sm" className={styles.skeletonBtn}>
              Chargement...
            </Button>
          )}
        </div>

        {/* FAB for mobile */}
        <motion.button
          type="button"
          aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          className={`${whatsappButtonStyle} ${isMobile ? styles.fabVisible : styles.fabHidden
            }`}
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          whileTap={{ scale: 0.95 }}
          animate={isMobileMenuOpen ? { rotate: 180 } : { rotate: 0 }}
          transition={spring}
        >
          {isMobileMenuOpen ? (
            <ICONS.close className="relative z-10" />
          ) : (
            <ICONS.menu className="relative z-10" />
          )}
        </motion.button>
      </div>

      {/* Mobile sheet/menu */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            className={styles.mobileSheet}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <ul className={styles.mobileList} role="menu">
              {NAV_ITEMS.map((item) => (
                <li key={item.name} role="none">
                  {item.path ? (
                    <Link
                      to={item.path}
                      role="menuitem"
                      className={`${styles.mobileItem} ${isActive(item.path) ? styles.active : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {IconFor(item.icon)}
                      <span>{item.name}</span>
                    </Link>
                  ) : (
                    <div className={styles.mobileGroup}>
                      <div className={styles.mobileGroupTitle}>
                        {IconFor(item.icon)}
                        <span>{item.name}</span>
                      </div>
                      <ul className={styles.mobileSubList}>
                        {item.children?.map((child) => (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              role="menuitem"
                              className={`${styles.mobileSubItem} ${isActive(child.path) ? styles.active : ''}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Center */}
      <NotificationCenter isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </motion.header>
  );
};

class ErrorBoundary extends React.Component<{ onError?: (message: string) => void; children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError?.(error.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className={styles.navError}>
          Une erreur est survenue dans la navigation.
        </div>
      )
    }
    return this.props.children as any;
  }
}

export default React.memo(UnifiedHeader);