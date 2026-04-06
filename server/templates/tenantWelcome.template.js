export const tenantWelcomeTemplate = (tenant) => ({
  subject: "Welcome — You're Almost In",
  html: `
  <body style="margin:0;padding:0;background:#0f0810;font-family:DM Sans,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:60px 20px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
            style="max-width:560px;background:#130b14;border-radius:18px;border:1px solid #3a1a3e;overflow:hidden;">

            <!-- Top Gradient -->
            <tr>
              <td style="height:3px;background:linear-gradient(90deg,#6b21a8,#a855f7,#e879f9,#a855f7,#6b21a8);"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td align="center" style="padding:48px 44px 44px;">

                <!-- Centered Icon (Email Safe) -->
                <table width="72" height="72" cellpadding="0" cellspacing="0"
                  style="margin:0 auto 28px;border-radius:50%;
                  background:linear-gradient(135deg,#581c87,#7e22ce);
                  border:1.5px solid #a855f7;">
                  <tr>
                    <td align="center" valign="middle"
                      style="font-size:32px;color:#d8b4fe;line-height:72px;">
                      ✨
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;font-size:11px;font-weight:500;
                  letter-spacing:.2em;text-transform:uppercase;color:#a855f7;">
                  Registration Received
                </p>

                <h1 style="margin:0 0 24px;
                  font-family:Cormorant Garamond,serif;
                  font-weight:300;
                  font-size:40px;
                  line-height:1.15;
                  color:#fdf4ff;">
                  Welcome aboard,<br>
                  <em style="color:#e9d5ff;">${tenant.name}</em>
                </h1>

                <div style="height:1px;
                  background:linear-gradient(90deg,transparent,#3a1a3e 30%,#a855f7 50%,#3a1a3e 70%,transparent);
                  margin-bottom:28px;">
                </div>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#c4a8cc;">
                  Your registration has been received and is currently
                  <span style="color:#e9d5ff;font-weight:500;">under review</span>
                  by our team.
                </p>

                <p style="margin:0 0 36px;font-size:15px;line-height:1.8;color:#c4a8cc;">
                  We verify every account carefully to maintain a secure platform.
                  You will receive an approval notification once the review is complete.
                </p>

                // <a href="mailto:support@yourcompany.com"
                //   style="display:inline-block;
                //   background:linear-gradient(135deg,#7e22ce,#a855f7);
                //   color:#fff;
                //   text-decoration:none;
                //   font-size:13px;
                //   font-weight:500;
                //   letter-spacing:.1em;
                //   text-transform:uppercase;
                //   padding:15px 42px;
                //   border-radius:50px;
                //   box-shadow:0 0 28px rgba(168,85,247,.3);">
                //   Contact Support →
                // </a>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center"
                style="padding:20px 44px 28px;border-top:1px solid #2a1230;">
                <p style="margin:0;font-size:12px;color:#5e3a6b;">
                  We'll be in touch shortly · © ${new Date().getFullYear()} Your Company
                </p>
              </td>
            </tr>

            <!-- Bottom Gradient -->
            <tr>
              <td style="height:3px;
                background:linear-gradient(90deg,transparent,#6b21a8 30%,#a855f7 50%,#6b21a8 70%,transparent);">
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  `
});