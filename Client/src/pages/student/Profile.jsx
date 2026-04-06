import { useForm } from "react-hook-form";
import { useUpdateProfile } from "@/hooks/student/useUpdateProfile";
import { useGetProfile } from "@/hooks/student/useGetProfile";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      rollNumber: "",
      classLevel: "",
      board: "",
      phone: "",
      parentName: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutateAsync, isPending } = useUpdateProfile();
  const { data: profileData } = useGetProfile();
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const profileUser = profileData?.user || user;

    if (profileUser) {
      reset({
        name: profileUser.name || "",
        email: profileUser.email || "",
        rollNumber: profileData?.profile?.rollNumber || "",
        classLevel: profileData?.profile?.classLevel || "",
        board: profileData?.profile?.board || "",
        phone: profileData?.profile?.phone || "",
        parentName: profileData?.profile?.parentName || "",
        newPassword: "",
        confirmPassword: "",
      });
      setPreview(
        profileUser?.profileImage
          ? `http://localhost:4000${profileUser.profileImage}`
          : "/avatar-holder.avif"
      );
    }
  }, [profileData, user, reset]);

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
    formData.append("phone", values.phone || "");
    formData.append("parentName", values.parentName || "");

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
            src={preview}
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {...register("phone")}
              className="mt-1 w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Parent Name
            </label>
            <input
              {...register("parentName")}
              className="mt-1 w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              type="password"
              {...register("newPassword")}
              placeholder="Enter new password"
              className="mt-1 w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              placeholder="Confirm new password"
              className="mt-1 w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
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
