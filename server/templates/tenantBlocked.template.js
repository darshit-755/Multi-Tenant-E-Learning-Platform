export const tenantBlockedTemplate = (tenant) => ({
  subject: "Important Notice Regarding Your Account",
  html: `
  <body style="margin:0;padding:0;background:#0f0a0a;font-family:DM Sans,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:60px 20px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
            style="max-width:560px;background:#130e0e;border-radius:18px;border:1px solid #3a1e1e;overflow:hidden;">

            <!-- Top Gradient -->
            <tr>
              <td style="height:3px;background:linear-gradient(90deg,#7f1d1d,#ef4444,#fca5a5,#ef4444,#7f1d1d);"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td align="center" style="padding:48px 44px 44px;">

                <!-- Warning Icon (Centered + Email Safe) -->
                <table width="72" height="72" cellpadding="0" cellspacing="0"
                  style="margin:0 auto 28px;border-radius:50%;
                  background:linear-gradient(135deg,#7f1d1d,#991b1b);
                  border:1.5px solid #ef4444;">
                  <tr>
                    <td align="center" valign="middle"
                      style="font-size:34px;color:#f87171;line-height:72px;">
                      !
                    </td>
                  </tr>
                </table>

                

                <p style="margin:0 0 8px;font-size:11px;font-weight:500;
                  letter-spacing:.2em;text-transform:uppercase;color:#ef4444;">
                  Access Restricted
                </p>

                <h1 style="margin:0 0 24px;
                  font-family:Cormorant Garamond,serif;
                  font-weight:300;
                  font-size:40px;
                  line-height:1.15;
                  color:#fff5f5;">
                  Account Blocked,<br>
                  <em style="color:#fca5a5;">${tenant.name}</em>
                </h1>

                <div style="height:1px;
                  background:linear-gradient(90deg,transparent,#3a1e1e 30%,#ef4444 50%,#3a1e1e 70%,transparent);
                  margin-bottom:28px;">
                </div>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#c9a8a8;">
                  Your account has been temporarily restricted due to a
                  <span style="color:#fca5a5;font-weight:500;">policy or compliance concern.</span>
                  Access to platform features has been disabled.
                </p>

                <p style="margin:0 0 36px;font-size:15px;line-height:1.8;color:#c9a8a8;">
                  If you believe this is an error or need clarification,
                  please contact our support team and we will assist you promptly.
                </p>

                // <a href="mailto:support@yourcompany.com"
                //   style="display:inline-block;
                //   background:linear-gradient(135deg,#991b1b,#ef4444);
                //   color:#fff;
                //   text-decoration:none;
                //   font-size:13px;
                //   font-weight:500;
                //   letter-spacing:.1em;
                //   text-transform:uppercase;
                //   padding:15px 42px;
                //   border-radius:50px;
                //   box-shadow:0 0 28px rgba(239,68,68,.3);">
                //   Contact Support →
                // </a>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center"
                style="padding:20px 44px 28px;border-top:1px solid #2e1a1a;">
                <p style="margin:0;font-size:12px;color:#6b3a3a;">
                  This action was taken to maintain a secure environment · © ${new Date().getFullYear()} Your Company
                </p>
              </td>
            </tr>

            <!-- Bottom Gradient -->
            <tr>
              <td style="height:3px;
                background:linear-gradient(90deg,transparent,#7f1d1d 30%,#ef4444 50%,#7f1d1d 70%,transparent);">
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  `
});