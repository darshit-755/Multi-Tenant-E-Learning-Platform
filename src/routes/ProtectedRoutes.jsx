import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, logout } = useAuth();
  // console.log("ProtectedRoute: user =", user);  


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user is suspended (backend stores as "blocked")
  if (user.status === "blocked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
        <Card className="max-w-md bg-slate-900/90 backdrop-blur border border-red-800 text-slate-100 shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 rounded-full bg-red-900/30 border border-red-800">
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.47 4.47a.75.75 0 011.06 0L10 8.94l4.47-4.47a.75.75 0 111.06 1.06L11.06 10l4.47 4.47a.75.75 0 11-1.06 1.06L10 11.06l-4.47 4.47a.75.75 0 01-1.06-1.06L8.94 10 4.47 5.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold">Account Suspended</h2>
              <p className="text-slate-400">
                Your account has been suspended and you no longer have access to the dashboard.
              </p>
              <p className="text-sm text-slate-500">
                If you believe this is a mistake, please contact the administrator.
              </p>
              <Button
                onClick={logout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium transition"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is inactive (requires approval)
  if (user.status === "inactive") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
        <Card className="max-w-md bg-slate-900/90 backdrop-blur border border-yellow-800 text-slate-100 shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 rounded-full bg-yellow-900/30 border border-yellow-800">
                <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.346 2.357-1.346 3.03 0l6.28 12.559c.668 1.34-.36 2.806-1.515 2.806H3.72c-1.155 0-2.183-1.467-1.515-2.806L8.485 2.495zM9 13a1 1 0 11-2 0 1 1 0 012 0zm-1-4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold">Account Pending Approval</h2>
              <p className="text-slate-400">
                Your account is currently inactive and pending administrator approval.
              </p>
              <p className="text-sm text-slate-500">
                Please wait for the admin to review and activate your account. This usually takes 24-48 hours.
              </p>
              <Button
                onClick={logout}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
