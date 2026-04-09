import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminFooter from "@/components/admin/AdminFooter";
import AdminHeader from "@/components/admin/AdminHeader";

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
     
      <AdminHeader />

      
      <div className="flex flex-1">

        <AdminSidebar />

        <main className="flex-1 bg-slate-100 p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;
