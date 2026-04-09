export const redirectByRole = (role, navigate) => {
  if (role === "superadmin") {
    navigate("/admin/dashboard");
  } else if (role === "tenant") {
    navigate("/tenant/dashboard");
  } else if (role === "tutor") {
    navigate("/tutor/dashboard");
  } else if (role === "student") {
    navigate("/student/dashboard");
  } else {
    navigate("/login");
  }
};
