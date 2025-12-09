import { FiBell, FiChevronDown, FiSearch, FiMenu, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface NavbarProps {
  title?: string;
  onOpenSidebar?: () => void;
  collapsed?: boolean;
}

export default function Navbar({ title = "Dashboard", onOpenSidebar, collapsed }: NavbarProps) {
  return (
    <header className={`w-full h-16 flex items-center justify-between px-4 sm:px-6 border-b border-[var(--color-border)] bg-[var(--color-card)] sticky top-0 z-20 transition-all duration-300`}>
      {/* Left: Hamburger (mobile) + Logo/Title */}
      <div className="flex items-center gap-3">
        {/* Hamburger for mobile */}
        {onOpenSidebar && (
          <button
            className="md:hidden mr-2 text-[var(--color-primary)] p-1 rounded hover:bg-[var(--color-primary)]/10"
            onClick={onOpenSidebar}
            aria-label="Open Sidebar"
          >
            <FiMenu size={24} />
          </button>
        )}
        <span className="text-2xl font-bold text-[var(--color-primary)] tracking-tight md:hidden">CRM</span>
        <span className="text-lg font-semibold text-[var(--color-card-foreground)] hidden sm:inline md:hidden">{title}</span>
      </div>
      {/* Search Bar (hidden on xs) */}
      <div className="flex-1 flex justify-center px-4 max-w-xs">
        <div className="relative w-full hidden sm:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 text-sm text-[var(--color-card-foreground)]"
          />
          <FiSearch className="absolute left-3 top-2.5 text-[var(--color-muted-foreground)]" size={18} />
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]">
          <FiBell size={22} />
          <span className="absolute -top-1 -right-1 bg-[var(--color-destructive)] text-[var(--color-primary-foreground)] text-xs rounded-full px-1 py-0.1">3</span>
        </button>
        {/* User Avatar Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-9 h-9 rounded-full bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)] font-bold border-2 border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30">
              <img
                src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
                alt="User Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="end" sideOffset={8}>
            <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center gap-3">
              <img
                src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-[var(--color-card-foreground)]">Santosh</div>
                <div className="text-xs text-[var(--color-muted-foreground)]">santosh@email.com</div>
              </div>
            </div>
            <div className="flex flex-col py-2">
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-card-foreground)] hover:bg-[var(--color-muted)] focus:bg-[var(--color-muted)] transition rounded w-full">
                <FiUser className="text-[var(--color-primary)]" /> Profile
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-card-foreground)] hover:bg-[var(--color-muted)] focus:bg-[var(--color-muted)] transition rounded w-full">
                <FiSettings className="text-[var(--color-primary)]" /> Settings
              </button>
            </div>
            <div className="border-t border-[var(--color-border)] my-1" />
            <div className="flex flex-col py-2">
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 focus:bg-[var(--color-destructive)]/10 transition rounded w-full">
                <FiLogOut /> Logout
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
