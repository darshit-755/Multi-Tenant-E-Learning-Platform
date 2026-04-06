export const tutorAddedTemplate = (user) => ({
  subject: "✦ Welcome as a Tutor - Tutorial App",
  html: `
  <body style="margin:0;padding:0;background:#0a0a1a;font-family:DM Sans,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:60px 20px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
            style="max-width:560px;background:#1a1a2e;border-radius:18px;border:1px solid #2d2d44;overflow:hidden;">

            <tr>
              <td style="height:3px;background:linear-gradient(90deg,#4f46e5,#7c3aed,#a855f7,#7c3aed,#4f46e5);"></td>
            </tr>

            <tr>
              <td align="center" style="padding:48px 44px 44px;">

                <table width="72" height="72" cellpadding="0" cellspacing="0"
                  style="margin:0 auto 28px;border-radius:50%;
                  background:linear-gradient(135deg,#4c1d95,#5b21b6);
                  border:1.5px solid #a855f7;">
                  <tr>
                    <td align="center" valign="middle"
                      style="font-size:34px;color:#c4b5fd;line-height:72px;">
                      🎓
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;font-size:11px;font-weight:500;
                  letter-spacing:.2em;text-transform:uppercase;color:#c4b5fd;">
                  Tutor Account Created
                </p>

                <h1 style="margin:0 0 24px;
                  font-family:Cormorant Garamond,serif;
                  font-weight:300;
                  font-size:38px;
                  line-height:1.15;
                  color:#f5f3ff;">
                  Welcome to Tutorial App,<br>
                  <em style="color:#c4b5fd;">${user.name}</em>
                </h1>

                <div style="height:1px;
                  background:linear-gradient(90deg,transparent,#2d2d44 30%,#7c3aed 50%,#2d2d44 70%,transparent);
                  margin-bottom:28px;">
                </div>

                <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#a8a8c0;">
                  You have been added to Tutorial App as a <strong style="color:#c4b5fd;">Tutor</strong>.
                  Your account is now active and ready to use.
                </p>

                <!-- Steps -->
                <div style="text-align:left;margin:0 auto 30px;max-width:420px;">
                  <p style="margin:0 0 10px;font-size:14px;color:#c4b5fd;font-weight:500;">
                    Steps to access your tutor account:
                  </p>

                  <ol style="margin:0;padding-left:18px;color:#a8a8c0;font-size:14px;line-height:1.8;">
                    <li>Click the <b>Login to Your Account</b> button below.</li>
                    <li>On the login page, click on <b>"Forgot Password"</b>.</li>
                    <li>Enter your registered <b>email address</b> to receive a password reset link.</li>
                    <li>Check your email and click on the reset link to <b>set your new password</b>.</li>
                    <li>After setting your password, <b>login with your new credentials</b>.</li>
                    <li>You'll be redirected to your tutor dashboard to start managing classes and students.</li>
                  </ol>
                </div>

                <p style="margin:0 0 32px;font-size:15px;line-height:1.8;color:#a8a8c0;">
                  <strong style="color:#c4b5fd;">Your registered email:</strong><br>
                  <span style="color:#f5f3ff;">${user.email}</span><br><br>
                  <span style="color:#a8a8c0;">Please set your password using the "Forgot Password" option on the login page.</span>
                </p>

                <a href="http://localhost:5173/login"
                  style="display:inline-block;
                  background:linear-gradient(135deg,#7c3aed,#a855f7);
                  color:#fff;
                  text-decoration:none;
                  font-size:13px;
                  font-weight:500;
                  letter-spacing:.1em;
                  text-transform:uppercase;
                  padding:15px 42px;
                  border-radius:50px;
                  box-shadow:0 0 28px rgba(168,85,247,.3);">
                  Login to Your Account →
                </a>

                <p style="margin:36px 0 0;font-size:13px;color:#7878a0;">
                  If you did not expect this email or have any questions,
                  please contact your administrator.
                </p>

              </td>
            </tr>

            <tr>
              <td align="center"
                style="padding:20px 44px 28px;border-top:1px solid #252538;">
                <p style="margin:0;font-size:12px;color:#5a5a78;">
                  © ${new Date().getFullYear()} Tutorial App · All Rights Reserved
                </p>
              </td>
            </tr>

            <tr>
              <td style="height:3px;
                background:linear-gradient(90deg,transparent,#4c1d95 30%,#7c3aed 50%,#4c1d95 70%,transparent);">
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  `,
});
