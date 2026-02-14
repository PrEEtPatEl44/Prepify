"use client";

import * as React from "react";
import { BookOpen, Briefcase, House, FileText, PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { NavUser } from "@/components/nav-user";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarGroup,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: House,
    },
    {
      title: "Jobs",
      url: "/jobs",
      icon: Briefcase,
    },
    {
      title: "Documents",
      url: "/docs",
      icon: BookOpen,
    },
    {
      title: "Templates",
      url: "/templates",
      icon: FileText,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const { state, toggleSidebar } = useSidebar();
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const isCollapsed = state === "collapsed";

  // Update after client mount
  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  // Reset logo hover state when sidebar expands
  useEffect(() => {
    if (!isCollapsed) {
      setIsLogoHovered(false);
    }
  }, [isCollapsed]);

  //temp fix to avoid sidebar on auth pages
  if (pathname.startsWith("/auth") || pathname.startsWith("/error")) {
    return null;
  }

  return (
    <Sidebar
      collapsible="icon"
      className={cn("shadow-xl", isCollapsed && "cursor-col-resize")}
      onClick={
        isCollapsed
          ? (e) => {
              // Only toggle if clicking empty space, not interactive elements
              const target = e.target as HTMLElement;
              if (!target.closest("a, button, [role='button']")) {
                toggleSidebar();
              }
            }
          : undefined
      }
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={cn(
              "flex items-center w-full",
              isCollapsed ? "justify-center" : "justify-between"
            )}>
              <div className={cn(
                "flex items-center",
                isCollapsed ? "justify-center" : "gap-2"
              )}>
                {isCollapsed ? (
                  <div
                    className="relative cursor-pointer"
                    onMouseEnter={() => setIsLogoHovered(true)}
                    onMouseLeave={() => setIsLogoHovered(false)}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSidebar();
                    }}
                  >
                    <Image
                      src="/logo.svg"
                      width={32}
                      height={32}
                      alt="logo"
                      className={cn(
                        "transition-opacity duration-200",
                        isLogoHovered && "opacity-0"
                      )}
                    />
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                      isLogoHovered ? "opacity-100" : "opacity-0"
                    )}>
                      <PanelLeft className="w-6 h-6 text-sidebar-foreground" />
                    </div>
                  </div>
                ) : (
                  <Image src="/logo.svg" width={32} height={32} alt="logo" />
                )}
                {!isCollapsed && (
                  <span className="truncate text-2xl text-foreground font-semibold">
                    Prepify
                  </span>
                )}
              </div>
              {!isCollapsed && <SidebarTrigger className="size-8" />}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        {/* Integrated NavMain content */}
        <SidebarGroup className={isCollapsed ? "px-2" : "px-0"}>
          <SidebarMenu>
            {data.navMain.map((item) => {
              const isActive = currentPath === item.url;
              return (
                <Link key={item.title} href={item.url}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="h-10"
                      isActive={isActive}
                    >
                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 top-0 h-full w-1 rounded-tr-lg rounded-br-lg bg-sidebar-accent-foreground" />
                      )}
                      {item.icon && (
                        <item.icon
                          className={
                            isCollapsed ? "!w-5 !h-5 mx-auto" : "!w-5 !h-5 ml-4"
                          }
                        />
                      )}
                      {!isCollapsed && (
                        <span className="text-[16px]">{item.title}</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser isCollapsed={isCollapsed} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
