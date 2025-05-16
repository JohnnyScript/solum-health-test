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
import Image from "next/image";
import { useMemo } from "react";
export function AppSidebar() {
  const pathname = usePathname();

  const routes = useMemo(
    () => [
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
    ],
    [pathname]
  );

  const RenderedRoutes = useMemo(() => {
    return (
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
    );
  }, [routes]);

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center py-4">
        <div className="flex items-center space-x-2 py-4">
          <Image
            src="/solum.png"
            alt="Solum Health Logo"
            width={200}
            height={200}
          />
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      {RenderedRoutes}
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
                <p className="text-xs text-muted-foreground">qa@getsolum.com</p>
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
