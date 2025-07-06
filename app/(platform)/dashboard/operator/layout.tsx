"use client"

import type React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"
import { logout } from "@/lib/actions/auth.actions"

const OperatorDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-200 p-4">
        {/* Sidebar content */}
        <h2 className="text-lg font-semibold mb-4">Operator Dashboard</h2>
        {/* Add navigation links here */}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <User className="mr-2 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={logout}>
                <button type="submit" className="w-full text-left">
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">{children}</main>
      </div>
    </div>
  )
}

export default OperatorDashboardLayout
