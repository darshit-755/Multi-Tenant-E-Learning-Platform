import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/auth/useAuthMutations";
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@/hooks/auth/useGoogleLogin";
import { useAuth } from "@/contexts/AuthContext";
import { redirectByRole } from "@/utils/roleRedirect";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import {
  handleIndianMobileInput,
  validateIndianMobileNumber,
} from "@/lib/phone";

export default function Register() {
  const navigate = useNavigate();
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleLoginMutation = useGoogleLogin();
  const { login } = useAuth();

  // Google popup dialog state
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [googlePhone, setGooglePhone] = useState("");
  const [googleAddress, setGoogleAddress] = useState("");
  const [googlePhoneError, setGooglePhoneError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  const registerMutation = useRegister();
  const passwordValue = useWatch({ control, name: "password" });
  const passwordRules = {
    hasMinLength: (passwordValue || "").length >= 6,
    hasUppercase: /[A-Z]/.test(passwordValue || ""),
    hasLowercase: /[a-z]/.test(passwordValue || ""),
    hasNumber: /\d/.test(passwordValue || ""),
    hasSpecial: /[^A-Za-z0-9]/.test(passwordValue || ""),
  };
  const shouldShowPasswordRules = Boolean(passwordValue);

  const onSubmit = (data) => {
    const payload = { ...data };
    delete payload.confirmPassword;
    registerMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Registration successful! Please wait for approval.");
        navigate("/login");
        reset();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Registration failed");
      },
    });
  };

  // Step 1: Google returns credential → open popup dialog
  const handleGoogleSignup = (credentialResponse) => {
    setGoogleCredential(credentialResponse.credential);
    setGooglePhone("");
    setGoogleAddress("");
    setGooglePhoneError("");
    setGoogleDialogOpen(true);
  };

  // Step 2: User fills phone & address in dialog → complete registration
  const handleGoogleDialogSubmit = async () => {
    // Validate phone
    if (!googlePhone.trim()) {
      setGooglePhoneError("Phone number is required");
      return;
    }
    const phoneValidation = validateIndianMobileNumber(googlePhone);
    if (phoneValidation !== true) {
      setGooglePhoneError(phoneValidation);
      return;
    }
    setGooglePhoneError("");

    try {
      setIsGoogleLoading(true);
      setGoogleDialogOpen(false);

      const response = await googleLoginMutation.mutateAsync({
        token: googleCredential,
        phone: googlePhone,
        address: googleAddress || undefined,
      });

      if (response?.data?.userStatus === "inactive" || !response?.data?.token) {
        toast.success("Registration successful! Awaiting admin approval.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      login(response?.data?.token, response?.data?.user);
      toast.success("Google signup successful!");
      const userRole = response?.data?.user?.role;
      redirectByRole(userRole, navigate);
    } catch (error) {
      toast.error(error.response?.data?.message || "Google signup failed");
    } finally {
      setIsGoogleLoading(false);
      setGoogleCredential(null);
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
     <Card className="w-[380px] bg-slate-900/90 backdrop-blur border border-slate-800 text-slate-100 shadow-2xl">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Center Name */}
            <div className="space-y-2">
              <Label htmlFor="tenantName">Center Name</Label>
              <Input
                id="tenantName"
                placeholder="Your Company Name"
                className={`bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500
                  focus-visible:ring-2 focus-visible:ring-slate-500
                  ${errors.tenantName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                {...register("tenantName", {
                  required: "Center name is required",
                })}
              />
              {errors.tenantName && (
                <p className="text-red-500 text-sm">{errors.tenantName.message}</p>
              )}
            </div>

            {/* Your Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                className={`bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500
                  focus-visible:ring-2 focus-visible:ring-slate-500
                  ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                {...register("name", {
                  required: "Name is required",
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

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
                    value:
                      /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                className={`bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500
                  focus-visible:ring-2 focus-visible:ring-slate-500
                  ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                {...register("phone", {
                  required: "Phone number is required",
                  validate: validateIndianMobileNumber,
                  onChange: handleIndianMobileInput,
                })}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
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
                    validate: {
                      hasUppercase: (value) =>
                        /[A-Z]/.test(value) || "Password must include at least one uppercase letter",
                      hasLowercase: (value) =>
                        /[a-z]/.test(value) || "Password must include at least one lowercase letter",
                      hasNumber: (value) =>
                        /\d/.test(value) || "Password must include at least one number",
                      hasSpecial: (value) =>
                        /[^A-Za-z0-9]/.test(value) || "Password must include at least one special character",
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
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
              {shouldShowPasswordRules && (
                <ul className="text-xs space-y-1 text-slate-300">
                  <li className={passwordRules.hasMinLength ? "text-emerald-400" : "text-red-400"}>
                    At least 6 characters
                  </li>
                  <li className={passwordRules.hasUppercase ? "text-emerald-400" : "text-red-400"}>
                    At least one uppercase letter
                  </li>
                  <li className={passwordRules.hasLowercase ? "text-emerald-400" : "text-red-400"}>
                    At least one lowercase letter
                  </li>
                  <li className={passwordRules.hasNumber ? "text-emerald-400" : "text-red-400"}>
                    At least one number
                  </li>
                  <li className={passwordRules.hasSpecial ? "text-emerald-400" : "text-red-400"}>
                    At least one special character
                  </li>
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 pr-10
                  focus-visible:ring-2 focus-visible:ring-slate-500
                  ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  {...register("confirmPassword", {
                    required: "Confirm password is required",
                    validate: (value) =>
                      value === passwordValue || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-200"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" 
            className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 font-medium transition"
             disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Registering..." : "Register"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-xs text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          {/* Google Signup Button */}
          <div className="flex flex-col items-center gap-2">
            {hasGoogleClientId ? (
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={() => toast.error("Google signup failed")}
                theme="dark"
                size="large"
                text="signup_with"
              />
            ) : (
              <p className="text-xs text-amber-300 text-center">
                Google signup is not configured. Add VITE_GOOGLE_CLIENT_ID in Client/.env.
              </p>
            )}
            {isGoogleLoading && (
              <p className="text-xs text-slate-400">Signing up with Google...</p>
            )}
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Google Signup – Phone & Address Dialog */}
      <Dialog open={googleDialogOpen} onOpenChange={(open) => {
        setGoogleDialogOpen(open);
        if (!open) setGoogleCredential(null);
      }}>
        <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur border border-slate-800 text-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">
              Complete Your Registration
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-center text-sm">
              Please provide your phone number to finish signing up
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Phone Number (required) */}
            <div className="space-y-2">
              <Label htmlFor="google-phone" className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                Phone Number <span className="text-red-400">*</span>
              </Label>
              <Input
                id="google-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={googlePhone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setGooglePhone(cleaned);
                  if (googlePhoneError) setGooglePhoneError("");
                }}
                className={`bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500
                  focus-visible:ring-2 focus-visible:ring-slate-500
                  ${googlePhoneError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {googlePhoneError && (
                <p className="text-red-500 text-sm">{googlePhoneError}</p>
              )}
            </div>

            {/* Address (optional) */}
            <div className="space-y-2">
              <Label htmlFor="google-address" className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                Address <span className="text-slate-500 text-xs font-normal">(optional)</span>
              </Label>
              <Input
                id="google-address"
                type="text"
                placeholder="Your address"
                value={googleAddress}
                onChange={(e) => setGoogleAddress(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500
                  focus-visible:ring-2 focus-visible:ring-slate-500"
              />
            </div>

            <Button
              onClick={handleGoogleDialogSubmit}
              disabled={isGoogleLoading}
              className="w-full bg-slate-100 mt-2 text-slate-900 hover:bg-slate-200 font-medium transition"
            >
              {isGoogleLoading ? "Signing up..." : "Continue"}
            </Button>
          </div>

          <DialogFooter>
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