import { Outlet } from "react-router-dom";
import TenantSidebar from "@/components/tenant/TenantSidebar";
import TenantFooter from "@/components/tenant/TenantFooter";
import TenantHeader from "@/components/tenant/TenantHeader";

const TenantLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
     
      <TenantHeader />

      
      <div className="flex flex-1">

        <TenantSidebar />

        <main className="flex-1 bg-slate-100 p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      
      <TenantFooter />
    </div>
  );
};

export default TenantLayout;
