export const tenantApprovedTemplate = (tenant) => ({
  subject: "✦ You're Approved — Welcome Aboard",
  html: `
  <body style="margin:0;padding:0;background:#0a0f0a;font-family:DM Sans,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:60px 20px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
            style="max-width:560px;background:#0e1510;border-radius:18px;border:1px solid #1e3a22;overflow:hidden;">

            <tr>
              <td style="height:3px;background:linear-gradient(90deg,#0d6e3a,#22c55e,#86efac,#22c55e,#0d6e3a);"></td>
            </tr>

            <tr>
              <td align="center" style="padding:48px 44px 44px;">

                <!-- Perfect Center Icon -->
                <table width="72" height="72" cellpadding="0" cellspacing="0"
                  style="margin:0 auto 28px;border-radius:50%;
                  background:linear-gradient(135deg,#14532d,#166534);
                  border:1.5px solid #22c55e;">
                  <tr>
                    <td align="center" valign="middle"
                      style="font-size:34px;color:#4ade80;line-height:72px;">
                      ✔
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;font-size:11px;font-weight:500;
                  letter-spacing:.2em;text-transform:uppercase;color:#4ade80;">
                  Account Verified
                </p>

                <h1 style="margin:0 0 24px;
                  font-family:Cormorant Garamond,serif;
                  font-weight:300;
                  font-size:40px;
                  line-height:1.15;
                  color:#f0fdf4;">
                  Congratulations,<br>
                  <em style="color:#86efac;">${tenant.name}</em>
                </h1>

                <div style="height:1px;
                  background:linear-gradient(90deg,transparent,#1e3a22 30%,#22c55e 50%,#1e3a22 70%,transparent);
                  margin-bottom:28px;">
                </div>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#a3b8a7;">
                  Your account has been successfully reviewed and approved.
                  You now have <span style="color:#86efac;font-weight:500;">full access</span>
                  to your dashboard and all platform features.
                </p>

                <p style="margin:0 0 36px;font-size:15px;line-height:1.8;color:#a3b8a7;">
                  Everything is set up and ready. We’re excited to have you on board.
                </p>

                // <a href="http://localhost:5173/tenant/dashboard"
                //   style="display:inline-block;
                //   background:linear-gradient(135deg,#16a34a,#22c55e);
                //   color:#fff;
                //   text-decoration:none;
                //   font-size:13px;
                //   font-weight:500;
                //   letter-spacing:.1em;
                //   text-transform:uppercase;
                //   padding:15px 42px;
                //   border-radius:50px;
                //   box-shadow:0 0 28px rgba(34,197,94,.3);">
                //   Enter Dashboard →
                // </a>

              </td>
            </tr>

            <tr>
              <td align="center"
                style="padding:20px 44px 28px;border-top:1px solid #1a2e1c;">
                <p style="margin:0;font-size:12px;color:#3d5c42;">
                  Questions? Just reply to this email · © ${new Date().getFullYear()} Your Company
                </p>
              </td>
            </tr>

            <tr>
              <td style="height:3px;
                background:linear-gradient(90deg,transparent,#14532d 30%,#22c55e 50%,#14532d 70%,transparent);">
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  `
});