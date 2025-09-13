"use client";

import * as React from "react";
import { BookOpen, Briefcase, Mic, House } from "lucide-react";
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
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useEffect, useState } from "react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
      title: "Interview",
      url: "/interview",
      icon: Mic,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Update after client mount
  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);
  return (
    <Sidebar collapsible="icon" className="shadow-xl" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Image src="/logo.svg" width={32} height={32} alt="logo" />

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-2xl text-black font-semibold">
                  Prepify
                </span>
              </div>
            </SidebarMenuButton>
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
                            isCollapsed ? "!w-4 !h-4" : "!w-5 !h-5 ml-4"
                          }
                        />
                      )}
                      <span className="text-[16px]">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
