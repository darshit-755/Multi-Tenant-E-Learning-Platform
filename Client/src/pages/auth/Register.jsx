import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/auth/useAuthMutations";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const registerMutation = useRegister();

  const onSubmit = (data) => {
    registerMutation.mutate(data, {
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

  return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
     <Card className="w-[380px] bg-slate-900/90 backdrop-blur border border-slate-800 text-slate-100 shadow-2xl">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Tenant Name */}
            <div className="space-y-2">
              <Label htmlFor="tenantName">Tenant Name</Label>
              <Input
                id="tenantName"
                placeholder="Your Company Name"
                className={`bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500
                  focus-visible:ring-2 focus-visible:ring-slate-500
                  ${errors.tenantName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                {...register("tenantName", {
                  required: "Tenant name is required",
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

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500
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
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" 
            className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 font-medium transition"
             disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Registering..." : "Register"}
            </Button>
          </form>
          
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}