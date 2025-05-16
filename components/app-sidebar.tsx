"use client";

import {
  BarChart3,
  Home,
  Phone,
  Settings,
  User,
  Building2,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

  const routes = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
      active: pathname === "/",
    },
    {
      title: "Calls",
      icon: Phone,
      href: "/calls",
      active: pathname === "/calls" || pathname.startsWith("/calls/"),
    },
    // {
    //   title: "Metrics",
    //   icon: BarChart3,
    //   href: "/metrics",
    //   active: pathname === "/metrics",
    // },
    {
      title: "Clinics",
      icon: Building2,
      href: "/clinics",
      active: pathname === "/clinics",
    },
    {
      title: "Assistants",
      icon: User,
      href: "/assistants",
      active: pathname === "/assistants",
    },
    // {
    //   title: "Settings",
    //   icon: Settings,
    //   href: "/settings",
    //   active: pathname === "/settings",
    // },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center py-4">
        <div className="flex items-center space-x-2 py-4">
          <div className="rounded-md bg-primary p-1">
            <Phone className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">Solum Health</h1>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton asChild isActive={route.active}>
                <a href={route.href}>
                  <route.icon className="h-5 w-5" />
                  <span>{route.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>QA</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">QA Analyst</p>
                <p className="text-xs text-muted-foreground">
                  analyst@solumhealth.com
                </p>
              </div>
            </div>
            <button className="rounded-full p-2 hover:bg-muted">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
