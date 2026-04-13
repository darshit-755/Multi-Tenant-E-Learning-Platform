import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useLogin } from "@/hooks/auth/useAuthMutations";
import { useGoogleLogin } from "@/hooks/auth/useGoogleLogin";
import { useAuth } from "@/contexts/AuthContext";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { redirectByRole } from "@/utils/roleRedirect";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";


export default function Login() {
  const navigate = useNavigate();
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { mutate: forgotPassword } = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();
  const { login } = useAuth();

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setIsGoogleLoading(true);
      // console.log("Google Credential Response:", credentialResponse);
      const response = await googleLoginMutation.mutateAsync(credentialResponse.credential);
      
      // Check if user needs approval
      if (response?.data?.userStatus === "inactive" || !response?.data?.token) {
        toast.success("Registration successful! Awaiting admin approval.");
        // Show pending approval message instead of logging in
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      login(response?.data?.token, response?.data?.user);
      toast.success("Google login successful!");
      
      const userRole = response?.data?.user?.role;
      redirectByRole(userRole, navigate);
    } catch (error) {
      toast.error(error.response?.data?.message || "Google login failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Google login failed");
  };

  const onSubmit = (data) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        login(res?.data?.token, res?.data?.user);

        toast.success("Login successful!");

        // Redirect based on user role
        const userRole = res?.data?.user?.role;
        redirectByRole(userRole, navigate);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Login failed");
      },
    });
  };

  const handleForgotPassword = () => {
   
    forgotPassword({email}, {
      onSuccess: () => {
        toast.success("Check Your Email For Reset Link");
        setOpen(false);
        setEmail("");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Forgot Password Fail");
      },
    });
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <Card className="w-[380px]   bg-slate-900/90 backdrop-blur border border-slate-800 text-slate-100 shadow-2xl">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500
                  focus-visible:ring-2 focus-visible:ring-slate-500
                  ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 pr-10
                  focus-visible:ring-2 focus-visible:ring-slate-500
                  ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
              <p className="text-left text-sm text-slate-400 mt-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="hover:text-white transition"
            >
              Forgot Password
            </button>
          </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200
                         font-medium transition"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-xs text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          {/* Google Login Button */}
          <div className="flex flex-col items-center gap-2">
            {hasGoogleClientId ? (
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                theme="dark"
                size="large"
                text="signin_with"
              />
            ) : (
              <p className="text-xs text-amber-300 text-center">
                Google login is not configured. Add VITE_GOOGLE_CLIENT_ID in Client/.env.
              </p>
            )}
            {isGoogleLoading && (
              <p className="text-xs text-slate-400">Signing in with Google...</p>
            )}
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
          
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur border border-slate-800 text-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">
              Forgot Password
            </DialogTitle>

            <DialogDescription className="text-slate-400 text-center text-sm">
              Enter your registered email address
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <Input
              placeholder="you@example.com"
              value={email}
              
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500
                   focus-visible:ring-2 focus-visible:ring-slate-500"
            />

            <Button
              onClick={handleForgotPassword}
              className="w-full bg-slate-100 mt-2 text-slate-900 hover:bg-slate-200 font-medium transition"
            >
              Send Reset Link
            </Button>
          </div>

          <DialogFooter className="">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-black w-full"
              >
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
