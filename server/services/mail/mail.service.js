//server/services/mail/mail.service.js
import transporter from "../../configs/mail.config.js";
import resend from "../../configs/resend.config.js";
import { MAIL_TYPES } from "./mail.constant.js";

import { tenantRegisterAdminTemplate } from "../../templates/tenantRegisterAdmin.template.js";
import { tenantWelcomeTemplate } from "../../templates/tenantWelcome.template.js";
import { tenantApprovedTemplate } from "../../templates/tenantApproved.template.js";
import { tenantInactiveTemplate } from "../../templates/tenantInactive.template.js";
import { tenantBlockedTemplate } from "../../templates/tenantBlocked.template.js";
import { tutorAddedTemplate } from "../../templates/tutorAdded.template.js";
import { studentAddedTemplate } from "../../templates/studentAdded.template.js";
import { classAssignedTutorTemplate } from "../../templates/classAssignedTutor.template.js";
import { classAssignedStudentTemplate } from "../../templates/classAssignedStudent.template.js";
import { passwordResetTemplate } from "../../templates/passwordReset.template.js";
import { classReminderStudentTemplate } from "../../templates/classReminderStudentTemplate.js";
import { classReminderTutorTemplate } from "../../templates/classReminderTutorTemplate.js";

const MAIL_PROVIDER = (process.env.MAIL_PROVIDER || "nodemailer").toLowerCase();
const RESEND_DUMMY_MAIL = process.env.RESEND_DUMMY_MAIL || "savaraakshay2366@gmail.com";

const getFromEmail = () => {
  return process.env.FROM_EMAIL || process.env.EMAIL_USER;
};

const sendWithProvider = async ({ to, subject, html }) => {
  const fromEmail = getFromEmail();

  if (!fromEmail) {
    throw new Error("Missing sender email. Set FROM_EMAIL (or EMAIL_USER) in env.");
  }

  if (MAIL_PROVIDER === "resend") {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("MAIL_PROVIDER is resend but RESEND_API_KEY is not set.");
    }

    // Route all Resend traffic to a single inbox for safe testing.
    const resendRecipient = RESEND_DUMMY_MAIL;

    const { error } = await resend.emails.send({
      from: `Tutorial App <${fromEmail}>`,
      to: resendRecipient,
      subject,
      html,
    });

    if (error) {
      throw new Error(error.message || "Resend failed to send email.");
    }

    return {
      deliveredTo: resendRecipient,
      originalTo: to,
    };
  }

  const info = await transporter.sendMail({
    from: `"Tutorial App" <${fromEmail}>`,
    to,
    subject,
    html,
  });

  return {
    messageId: info.messageId,
    deliveredTo: to,
    originalTo: to,
  };
};

export const sendTenantMail = async (type, tenant, options = {}) => {
  try {
    let mailData;
    let recipient;

    console.log(`[Mail Service] Preparing email | type: ${type} | to: ${tenant?.email}`);

    switch (type) {
      case MAIL_TYPES.TENANT_REGISTER_ADMIN:
        mailData = tenantRegisterAdminTemplate(tenant);
        recipient = process.env.ADMIN_EMAIL;
        break;

      case MAIL_TYPES.TENANT_WELCOME:
        mailData = tenantWelcomeTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.TENANT_APPROVED:
        mailData = tenantApprovedTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.TENANT_INACTIVE:
        mailData = tenantInactiveTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.TENANT_BLOCKED:
        mailData = tenantBlockedTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.TUTOR_ADDED:
        mailData = tutorAddedTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.STUDENT_ADDED:
        mailData = studentAddedTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.CLASS_ASSIGNED_TUTOR:
        mailData = classAssignedTutorTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.CLASS_ASSIGNED_STUDENT:
        mailData = classAssignedStudentTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.CLASS_REMINDER_STUDENT:
        mailData = classReminderStudentTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.CLASS_REMINDER_TUTOR:
        mailData = classReminderTutorTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.PASSWORD_RESET:
        mailData = passwordResetTemplate(tenant, options.resetLink);
        recipient = tenant.email;
        break;

      default:
        throw new Error(`Invalid Mail Type: ${type}`);
    }

    if (!recipient) {
      throw new Error(`Recipient email is missing for mail type: ${type}`);
    }

    const deliveryResult = await sendWithProvider({
      to: recipient,
      subject: mailData.subject,
      html: mailData.html,
    });

    console.log(
      `[Mail Service] ✅ Email sent successfully | provider: ${MAIL_PROVIDER} | type: ${type} | to: ${deliveryResult?.deliveredTo || recipient} | originalTo: ${deliveryResult?.originalTo || recipient}${
        deliveryResult?.messageId ? ` | messageId: ${deliveryResult.messageId}` : ""
      }`,
    );
  } catch (error) {
    console.error(`[Mail Service] ❌ Email sending failed | type: ${type} | error: ${error.message}`);
  }
};
