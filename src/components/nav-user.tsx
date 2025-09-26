"use client";

import { ChevronsUpDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import UserDropdown from "@/components/user-dropdown";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks/useUser";

export function NavUser() {
  const { profile, loading } = useUser();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {loading || !profile ? (
          // Loading state - always render this structure during loading
          <SidebarMenuButton size="lg" disabled>
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg animate-pulse">
                <div className="h-full w-full bg-muted-foreground/20 rounded-lg" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-3 bg-muted-foreground/20 rounded animate-pulse mt-1" />
            </div>
            <ChevronsUpDown className="ml-auto size-4 opacity-50" />
          </SidebarMenuButton>
        ) : (
          // Loaded state with user data
          <UserDropdown sideForMobile="bottom" sideForDesktop="right">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="rounded-lg">
                  {profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{profile.name}</span>
                <span className="truncate text-xs">{profile.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </UserDropdown>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
