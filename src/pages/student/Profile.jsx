import { useForm } from "react-hook-form";
import { useUpdateProfile } from "@/hooks/student/useUpdateProfile";
import { useGetProfile } from "@/hooks/student/useGetProfile";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resolveMediaUrl } from "@/lib/media";
import { Eye, EyeOff } from "lucide-react";
import {
  handleIndianMobileInput,
  normalizeIndianMobileNumber,
  validateIndianMobileNumber,
} from "@/lib/phone";

import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      rollNumber: "",
      classLevel: "",
      board: "",
      phone: "",
      fatherName: "",
      motherName: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutateAsync, isPending } = useUpdateProfile();
  const { data: profileData } = useGetProfile();
  const [preview, setPreview] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const profileUser = profileData?.user || user;
  const previewSrc = preview || resolveMediaUrl(profileUser?.profileImage);

  useEffect(() => {
    if (profileUser) {
      reset({
        name: profileUser.name || "",
        email: profileUser.email || "",
        rollNumber: profileData?.profile?.rollNumber || "",
        classLevel: profileData?.profile?.classLevel || "",
        board: profileData?.profile?.board || "",
        phone: normalizeIndianMobileNumber(profileData?.profile?.phone || ""),
        fatherName: profileData?.profile?.fatherName || "",
        motherName: profileData?.profile?.motherName || "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [profileData, profileUser, reset, user]);

  const onSubmit = async (values) => {
    const hasPasswordInput = values.newPassword || values.confirmPassword;
    if (hasPasswordInput) {
      if (!values.newPassword || !values.confirmPassword) {
        toast.error("Please fill both password fields");
        return;
      }
      if (values.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }
      if (values.newPassword !== values.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("rollNumber", values.rollNumber || "");
    formData.append("classLevel", values.classLevel || "");
    formData.append("board", values.board || "");
    if (values.phone) {
      formData.append("phone", values.phone);
    }
    formData.append("fatherName", values.fatherName || "");
    formData.append("motherName", values.motherName || "");

    if (values.photo?.[0]) {
      formData.append("profileImage", values.photo[0]);
    }

    if (hasPasswordInput) {
      formData.append("password", values.newPassword);
    }

    

    try {
      const res = await mutateAsync(formData);
      
      if (res?.data?.user) {
        toast.success("Profile updated successfully!");
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate("/student/dashboard");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="sm:min-w-xl  ">
      <div className="sm:min-w-xl bg-white rounded-xl shadow-md border border-slate-200 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={previewSrc}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-slate-300 shadow"
          />

          <label className="mt-3 cursor-pointer text-sm text-indigo-600 hover:underline">
            Change photo
            <input
              type="file"
              className="hidden"
              {...register("photo", {
                onChange: (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPreview(URL.createObjectURL(file));
                  }
                },
              })}
            />
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              {...register("name")}
              className="mt-1 w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              {...register("email")}
              className="mt-1 w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Roll Number
            </label>
            <input
              {...register("rollNumber")}
              className="mt-1 w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Class Level
            </label>
            <input
              {...register("classLevel")}
              className="mt-1 w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Board
            </label>
            <input
              {...register("board")}
              className="mt-1 w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel-national"
              {...register("phone", {
                setValueAs: normalizeIndianMobileNumber,
                validate: validateIndianMobileNumber,
              })}
              onInput={handleIndianMobileInput}
              className="mt-1 w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Father Name
            </label>
            <input
              {...register("fatherName")}
              className="mt-1 w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mother Name
            </label>
            <input
              {...register("motherName")}
              className="mt-1 w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showNewPassword ? "text" : "password"}
                {...register("newPassword")}
                placeholder="Enter new password"
                className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 pr-10 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Confirm new password"
                className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 pr-10 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

         
           <div className="flex justify-center md:justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto rounded-lg bg-indigo-600 text-white py-2 px-3 font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? "Updating..." : "Update Profile"}
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
