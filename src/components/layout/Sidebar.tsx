import { CalendarDays, ChartNoAxesCombined, ClipboardList, LayoutDashboard, Package, ReceiptText, Sprout, Truck, Users, Wheat, Warehouse, X } from "lucide-react";
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
  { to: "/expenses", label: "Expenses", icon: ReceiptText, section: "Reports" },
  { to: "/reports", label: "Reports", icon: ChartNoAxesCombined },
];

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const mobileSidebarOpen = useUIStore((state) => state.mobileSidebarOpen);
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar);
  const lowFarmInputCount = useFarmInputBadgeCount();
  const metrics = useDashboardMetrics();
  let previousSection = "";
  const upcomingCount = metrics.upcomingHarvest.filter((crop) => crop.forecastHarvest >= todayISO()).length;

  return (
    <>
      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-foreground/35 md:hidden"
          onClick={closeMobileSidebar}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r bg-leaf-700 text-leaf-50 transition-transform duration-200 md:static md:z-auto md:translate-x-0 md:transition-all",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarOpen ? "md:w-72" : "md:w-20",
        )}
      >
        <div className="border-b border-leaf-600 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-soil-100 text-leaf-700">
              <Sprout className="h-5 w-5" />
            </div>
            <div className={cn(!sidebarOpen && "md:hidden")}>
              <p className="font-serif text-2xl leading-none">Hazel AgriTrack</p>
              <p className="text-xs text-leaf-100/70">Farm operations</p>
            </div>
            <button
              type="button"
              aria-label="Close sidebar"
              className="ml-auto rounded-md p-2 text-leaf-50/80 transition-colors hover:bg-leaf-600 hover:text-white md:hidden"
              onClick={closeMobileSidebar}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {links.map((link) => {
            const showSection = link.section && link.section !== previousSection;
            if (link.section) previousSection = link.section;
            const Icon = link.icon;
            const badgeCount = link.to === "/farm-inputs" ? lowFarmInputCount : link.to === "/harvest-calendar" ? upcomingCount : 0;
            return (
              <div key={link.to}>
                {showSection ? (
                  <p className={cn("px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-wide text-leaf-100/50", !sidebarOpen && "md:hidden")}>
                    {link.section}
                  </p>
                ) : null}
                <NavLink
                  to={link.to}
                  onClick={closeMobileSidebar}
                  className={({ isActive }) =>
                    cn(
                      "mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-leaf-50/75 transition-colors hover:bg-leaf-600 hover:text-white",
                      isActive && "bg-leaf-500 text-white shadow-sm",
                      !sidebarOpen && "md:justify-center",
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className={cn(!sidebarOpen && "md:hidden")}>{link.label}</span>
                  {badgeCount > 0 ? <Badge variant="red" className={cn("ml-auto", !sidebarOpen && "md:hidden")}>{badgeCount}</Badge> : null}
                </NavLink>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
