
import transporter from "../../configs/mail.config.js";
import { MAIL_TYPES } from "./mail.constant.js";

const dummyEmail = "voltix755@gmail.com";

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
import { classReminderStudentTemplate } from "../../templates/classReminderStudentTemplate.js"
import { classReminderTutorTemplate } from "../../templates/classReminderTutorTemplate.js"

export const sendTenantMail = async (type, tenant, options = {}) => {
  try {
    let mailData;
    let recipient;
    // console.log("Preparing to send email of type:", tenant, type);

    switch (type) {
      case MAIL_TYPES.TENANT_REGISTER_ADMIN:
        mailData = tenantRegisterAdminTemplate(tenant);
        recipient = process.env.ADMIN_EMAIL; // send to admin
        break;

      case MAIL_TYPES.TENANT_WELCOME:
        mailData = tenantWelcomeTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.TENANT_APPROVED:
        mailData = tenantApprovedTemplate(tenant);
        console.log
          ("Tenant Approved Mail Data:", process.env.ADMIN_EMAIL);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.TENANT_INACTIVE:
        mailData = tenantInactiveTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.TENANT_BLOCKED:
        mailData = tenantBlockedTemplate(tenant);
        console.log("Tenant Approved Mail Data:", process.env.ADMIN_EMAIL);
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
        throw new Error("Invalid Mail Type");
    }

    await transporter.sendMail({
      from: `"Tutorial App" <${process.env.EMAIL_USER}>`,
      to: dummyEmail,
      subject: mailData.subject,
      html: mailData.html,
    });

    // console.log(` Email sent successfully: ${type}`);
  } catch (error) {
    console.error(" Email sending failed:", error.message);
  }
};