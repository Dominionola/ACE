"use client"

import * as React from "react"
import {
  BookOpen,
  Calendar,
  MessageSquare,
  Settings,
  Plus,
  Library,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/Logo"

// ACE navigation data
const navMain = [
  {
    title: "My Decks",
    url: "/dashboard/decks",
    icon: Library,
    isActive: true,
    items: [
      {
        title: "All Decks",
        url: "/dashboard/decks",
      },
      {
        title: "Create New",
        url: "/dashboard/decks/new",
      },
    ],
  },
  {
    title: "Study Sessions",
    url: "/dashboard/study",
    icon: BookOpen,
    items: [
      {
        title: "Today's Review",
        url: "/dashboard/study/today",
      },
      {
        title: "History",
        url: "/dashboard/study/history",
      },
    ],
  },
  {
    title: "Schedule",
    url: "/dashboard/schedule",
    icon: Calendar,
    items: [
      {
        title: "My Schedule",
        url: "/dashboard/schedule",
      },
      {
        title: "Upcoming Exams",
        url: "/dashboard/schedule/exams",
      },
    ],
  },
  {
    title: "AI Tutor",
    url: "/dashboard/chat",
    icon: MessageSquare,
    items: [
      {
        title: "New Chat",
        url: "/dashboard/chat",
      },
      {
        title: "Chat History",
        url: "/dashboard/chat/history",
      },
    ],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    items: [
      {
        title: "Profile",
        url: "/dashboard/settings/profile",
      },
      {
        title: "Preferences",
        url: "/dashboard/settings/preferences",
      },
    ],
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard" className="flex items-center">
                <Logo className="h-8 w-8" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Quick Action */}
        <SidebarMenu className="px-2 py-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full justify-center"
            >
              <a href="/dashboard/decks/new" className="flex items-center gap-2">
                <Plus strokeWidth={1.5} className="h-4 w-4" />
                <span>Create Deck</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}


