import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">
          Access Denied
        </h1>

        <p className="text-slate-400">
          You do not have permission to access this page.
        </p>

        <Button onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
