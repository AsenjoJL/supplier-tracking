import { CalendarDays, ChartNoAxesCombined, ClipboardList, LayoutDashboard, Package, Sprout, Truck, Users, Wheat, Warehouse } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useDashboardMetrics } from "@/features/dashboard/hooks/useDashboardMetrics";
import { useFarmInputBadgeCount } from "@/features/farm-inputs/hooks/useFarmInputBadgeCount";
import { cn, todayISO } from "@/lib/utils";
import { useUIStore } from "@/stores/useUIStore";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
  { to: "/suppliers", label: "Suppliers", icon: Users, section: "Management" },
  { to: "/products", label: "Products", icon: Package },
  { to: "/open-listing", label: "Open Listing", icon: ClipboardList },
  { to: "/stock-in", label: "Stock In", icon: Warehouse },
  { to: "/stock-out", label: "Stock Out", icon: Truck },
  { to: "/farm-inputs", label: "Farm Inputs", icon: Sprout, section: "Farm" },
  { to: "/crop-monitoring", label: "Crop Monitoring", icon: Wheat },
  { to: "/harvest-calendar", label: "Harvest Calendar", icon: CalendarDays },
  { to: "/tarha", label: "Tarha", icon: ClipboardList, section: "Quality" },
  { to: "/reports", label: "Reports", icon: ChartNoAxesCombined, section: "Reports" },
];

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const lowFarmInputCount = useFarmInputBadgeCount();
  const metrics = useDashboardMetrics();
  let previousSection = "";
  const upcomingCount = metrics.upcomingHarvest.filter((crop) => crop.forecastHarvest >= todayISO()).length;

  return (
    <aside className={cn("hidden h-screen shrink-0 border-r bg-leaf-700 text-leaf-50 transition-all md:flex md:flex-col", sidebarOpen ? "w-72" : "w-20")}>
      <div className="border-b border-leaf-600 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-soil-100 text-leaf-700">
            <Sprout className="h-5 w-5" />
          </div>
          {sidebarOpen ? (
            <div>
              <p className="font-serif text-2xl leading-none">Hazel AgriTrack</p>
              <p className="text-xs text-leaf-100/70">Farm operations</p>
            </div>
          ) : null}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {links.map((link) => {
          const showSection = sidebarOpen && link.section && link.section !== previousSection;
          if (link.section) previousSection = link.section;
          const Icon = link.icon;
          const badgeCount = link.to === "/farm-inputs" ? lowFarmInputCount : link.to === "/harvest-calendar" ? upcomingCount : 0;
          return (
            <div key={link.to}>
              {showSection ? <p className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-wide text-leaf-100/50">{link.section}</p> : null}
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-leaf-50/75 transition-colors hover:bg-leaf-600 hover:text-white",
                    isActive && "bg-leaf-500 text-white shadow-sm",
                    !sidebarOpen && "justify-center",
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {sidebarOpen ? <span>{link.label}</span> : null}
                {sidebarOpen && badgeCount > 0 ? <Badge variant="red" className="ml-auto">{badgeCount}</Badge> : null}
              </NavLink>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
