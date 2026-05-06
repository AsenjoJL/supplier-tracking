import { Bell, Menu, Moon, Sun, UserCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";

export function Header() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar);
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const handleSidebarToggle = () => {
    const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop) {
      toggleSidebar();
      return;
    }
    toggleMobileSidebar();
  };

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b bg-background/90 px-3 backdrop-blur sm:px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" onClick={handleSidebarToggle} aria-label="Toggle sidebar">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Hazel AgriTrack</p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">Supplier & farm inventory</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications" className="hidden sm:inline-flex">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-9 px-0 sm:w-auto sm:max-w-64 sm:px-3">
              <UserCircle className="h-4 w-4" />
              <span className="hidden truncate sm:inline">{user?.email ?? "User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.displayName ?? user?.email ?? "Signed in"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void handleSignOut()}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
