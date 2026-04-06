export const tenantRegisterAdminTemplate = (tenant) => ({
  subject: "New Tenant Registration Request",
  html: `
  <body style="margin:0;padding:0;background:#080c14;font-family:DM Sans,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:60px 20px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
            style="max-width:560px;background:#0b1020;border-radius:18px;border:1px solid #1e2d4a;overflow:hidden;">

            <!-- Top Gradient -->
            <tr>
              <td style="height:3px;background:linear-gradient(90deg,#1e3a8a,#3b82f6,#93c5fd,#3b82f6,#1e3a8a);"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td align="center" style="padding:48px 44px 36px;">

                <!-- Centered Icon (Email Safe) -->
                <table width="72" height="72" cellpadding="0" cellspacing="0"
                  style="margin:0 auto 28px;border-radius:50%;
                  background:linear-gradient(135deg,#1e3a8a,#1d4ed8);
                  border:1.5px solid #3b82f6;">
                  <tr>
                    <td align="center" valign="middle"
                      style="font-size:32px;color:#60a5fa;line-height:72px;">
                      👤
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;font-size:11px;font-weight:500;
                  letter-spacing:.2em;text-transform:uppercase;color:#3b82f6;">
                  Action Required
                </p>

                <h1 style="margin:0 0 24px;
                  font-family:Cormorant Garamond,serif;
                  font-weight:300;
                  font-size:40px;
                  line-height:1.15;
                  color:#eff6ff;">
                  New Registration<br>
                  <em style="color:#93c5fd;">Awaiting Review</em>
                </h1>

                <div style="height:1px;
                  background:linear-gradient(90deg,transparent,#1e2d4a 30%,#3b82f6 50%,#1e2d4a 70%,transparent);
                  margin-bottom:28px;">
                </div>

                <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#94a8c7;">
                  A new tenant has submitted a registration request.
                  Please review the details below and
                  <span style="color:#93c5fd;font-weight:500;">
                    take the necessary approval action
                  </span>
                  at your earliest convenience.
                </p>

                <!-- Details Card -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#0d1628;border:1px solid #1e2d4a;
                  border-radius:12px;margin-bottom:36px;">
                  <tr>
                    <td style="padding:20px 24px;border-bottom:1px solid #1e2d4a;">
                      <p style="margin:0 0 3px;font-size:11px;
                        letter-spacing:.12em;text-transform:uppercase;color:#3b82f6;">
                        Name
                      </p>
                      <p style="margin:0;font-size:15px;color:#eff6ff;">
                        ${tenant.name}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 3px;font-size:11px;
                        letter-spacing:.12em;text-transform:uppercase;color:#3b82f6;">
                        Email
                      </p>
                      <p style="margin:0;font-size:15px;color:#eff6ff;">
                        ${tenant.email}
                      </p>
                    </td>
                  </tr>
                </table>

                // <a href="http://localhost:5173/admin/tenants"
                //   style="display:inline-block;
                //   background:linear-gradient(135deg,#1d4ed8,#3b82f6);
                //   color:#fff;
                //   text-decoration:none;
                //   font-size:13px;
                //   font-weight:500;
                //   letter-spacing:.1em;
                //   text-transform:uppercase;
                //   padding:15px 42px;
                //   border-radius:50px;
                //   box-shadow:0 0 28px rgba(59,130,246,.3);">
                //   Review Request →
                // </a>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center"
                style="padding:20px 44px 28px;border-top:1px solid #151f33;">
                <p style="margin:0;font-size:12px;color:#334966;">
                  Timely review ensures smooth onboarding · © ${new Date().getFullYear()} Your Company
                </p>
              </td>
            </tr>

            <!-- Bottom Gradient -->
            <tr>
              <td style="height:3px;
                background:linear-gradient(90deg,transparent,#1e3a8a 30%,#3b82f6 50%,#1e3a8a 70%,transparent);">
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  `
});