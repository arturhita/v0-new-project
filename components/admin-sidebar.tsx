"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  MessageSquare,
  CreditCard,
  Star,
  Settings,
  BarChart3,
  History,
  Receipt,
  Trophy,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard/admin",
  },
  {
    title: "Gestione",
    items: [
      {
        title: "Utenti",
        icon: Users,
        href: "/dashboard/admin/users",
      },
      {
        title: "Consulenti",
        icon: UserCheck,
        href: "/dashboard/admin/consultants",
      },
      {
        title: "Consulenze",
        icon: MessageSquare,
        href: "/dashboard/admin/consultations",
      },
    ],
  },
  {
    title: "Finanziario",
    items: [
      {
        title: "Pagamenti",
        icon: CreditCard,
        href: "/dashboard/admin/payments",
      },
      {
        title: "Fatture",
        icon: Receipt,
        href: "/dashboard/admin/invoices",
      },
      {
        title: "Transazioni",
        icon: History,
        href: "/dashboard/admin/transactions",
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        title: "Recensioni",
        icon: Star,
        href: "/dashboard/admin/reviews",
      },
      {
        title: "Analytics",
        icon: BarChart3,
        href: "/dashboard/admin/analytics",
      },
      {
        title: "Premi",
        icon: Trophy,
        href: "/dashboard/admin/rewards",
      },
      {
        title: "Impostazioni",
        icon: Settings,
        href: "/dashboard/admin/settings",
      },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r bg-gradient-to-b from-red-50 to-pink-50">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CP</span>
          </div>
          <div>
            <h3 className="font-semibold text-red-600">ConsultaPro</h3>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((section, index) => (
          <SidebarGroup key={index}>
            {section.title && section.items ? (
              <>
                <SidebarGroupLabel className="text-red-600 font-medium">{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          className="hover:bg-red-100 data-[active=true]:bg-red-200 data-[active=true]:text-red-700"
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </>
            ) : (
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === section.href}
                      className="hover:bg-red-100 data-[active=true]:bg-red-200 data-[active=true]:text-red-700"
                    >
                      <Link href={section.href!}>
                        <section.icon className="h-4 w-4" />
                        <span>{section.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">
          <p>v2.1.0</p>
          <p>© 2024 ConsultaPro</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
