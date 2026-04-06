import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useResetPassword } from "@/hooks/auth/useForgotPassword";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { mutate: resetPassword } = useResetPassword();

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      return toast.error("All fields required");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    resetPassword(
      { token, password },
      {
        onSuccess: () => {
          toast.success(
            "Password reset successful! Please login with your new password.",
          );
          navigate("/login");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Password reset failed");
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <Card className="w-[400px] bg-slate-900/90 backdrop-blur border border-slate-800 text-slate-100 shadow-2xl">
        <CardContent className="pt-8 pb-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Reset Password</h2>

           
          </div>

          <div className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label className="text-slate-300">New Password</Label>

              <Input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500
                         focus-visible:ring-2 focus-visible:ring-slate-500"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-slate-300">Confirm Password</Label>

              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500
                         focus-visible:ring-2 focus-visible:ring-slate-500"
              />
            </div>
          </div>

          <Button
            className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 font-medium transition"
            onClick={handleReset}
          >
            Reset Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
