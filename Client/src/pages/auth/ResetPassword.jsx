import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useResetPassword } from "@/hooks/auth/useForgotPassword";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const { mutate: resetPassword } = useResetPassword();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data) => {
    if (!data.password || !data.confirmPassword) {
      return toast.error("All fields required");
    }

    if (data.password !== data.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    resetPassword(
      { token, password: data.password },
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label className="text-slate-300">New Password</Label>

              <Input
                type="password"
                placeholder="Enter new password"
                {...register("password")}
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
                {...register("confirmPassword")}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500
                         focus-visible:ring-2 focus-visible:ring-slate-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 font-medium transition"
            >
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
