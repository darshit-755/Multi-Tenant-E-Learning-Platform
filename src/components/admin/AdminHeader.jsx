import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { AdminSidebarContent } from "./AdminSidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { resolveMediaUrl } from "@/lib/media";

const AdminHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-4 lg:px-6">
      
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <button className="lg:hidden">
              <Menu />
            </button>
          </SheetTrigger>

          <SheetContent
            side="top"
            className="max-h-full w-full bg-slate-900 text-white p-4"
          >
            <h2 className="mb-4 font-semibold">Admin</h2>
            <AdminSidebarContent />
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-semibold hidden sm:block">
          Admin Dashboard
        </h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage src={resolveMediaUrl(user?.profileImage)} />
            <AvatarFallback>
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
            Edit Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-500 focus:text-red-500"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default AdminHeader;
