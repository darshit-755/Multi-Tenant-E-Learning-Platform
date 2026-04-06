export const tenantInactiveTemplate = (tenant) => ({
  subject: "Your Account Is Currently Inactive",
  html: `
  <body style="margin:0;padding:0;background:#0f0d08;font-family:DM Sans,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:60px 20px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
            style="max-width:560px;background:#141008;border-radius:18px;border:1px solid #3a2e0e;overflow:hidden;">

            <!-- Top Gradient -->
            <tr>
              <td style="height:3px;background:linear-gradient(90deg,#78350f,#f59e0b,#fde68a,#f59e0b,#78350f);"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td align="center" style="padding:48px 44px 44px;">

                <!-- Centered Icon (Email Safe) -->
                <table width="72" height="72" cellpadding="0" cellspacing="0"
                  style="margin:0 auto 28px;border-radius:50%;
                  background:linear-gradient(135deg,#78350f,#92400e);
                  border:1.5px solid #f59e0b;">
                  <tr>
                    <td align="center" valign="middle"
                      style="font-size:34px;color:#fbbf24;line-height:72px;">
                      ⚠
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;font-size:11px;font-weight:500;
                  letter-spacing:.2em;text-transform:uppercase;color:#f59e0b;">
                  Account Inactive
                </p>

                <h1 style="margin:0 0 24px;
                  font-family:Cormorant Garamond,serif;
                  font-weight:300;
                  font-size:40px;
                  line-height:1.15;
                  color:#fffbeb;">
                  Heads Up,<br>
                  <em style="color:#fde68a;">${tenant.name}</em>
                </h1>

                <div style="height:1px;
                  background:linear-gradient(90deg,transparent,#3a2e0e 30%,#f59e0b 50%,#3a2e0e 70%,transparent);
                  margin-bottom:28px;">
                </div>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#c9b87a;">
                  Your account has been marked as
                  <span style="color:#fde68a;font-weight:500;"> temporarily inactive</span>,
                  possibly due to an administrative review or compliance verification.
                </p>

                <p style="margin:0 0 36px;font-size:15px;line-height:1.8;color:#c9b87a;">
                  If you believe this was applied in error, our support team
                  is ready to assist you right away.
                </p>

                // <a href="mailto:support@yourcompany.com"
                //   style="display:inline-block;
                //   background:linear-gradient(135deg,#92400e,#f59e0b);
                //   color:#fff;
                //   text-decoration:none;
                //   font-size:13px;
                //   font-weight:500;
                //   letter-spacing:.1em;
                //   text-transform:uppercase;
                //   padding:15px 42px;
                //   border-radius:50px;
                //   box-shadow:0 0 28px rgba(245,158,11,.3);">
                //   Contact Support →
                // </a>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center"
                style="padding:20px 44px 28px;border-top:1px solid #2e2410;">
                <p style="margin:0;font-size:12px;color:#6b5a2a;">
                  We're here to help resolve this quickly · © ${new Date().getFullYear()} Your Company
                </p>
              </td>
            </tr>

            <!-- Bottom Gradient -->
            <tr>
              <td style="height:3px;
                background:linear-gradient(90deg,transparent,#78350f 30%,#f59e0b 50%,#78350f 70%,transparent);">
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  `
});