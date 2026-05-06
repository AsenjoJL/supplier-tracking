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
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm font-semibold">Hazel AgriTrack</p>
          <p className="text-xs text-muted-foreground">Supplier & farm inventory</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <UserCircle className="h-4 w-4" />
              {user?.email ?? "User"}
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
