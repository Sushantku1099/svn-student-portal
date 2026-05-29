import nodemailer from 'nodemailer';

type MailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isEmailConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function sendMail({ to, subject, html, text }: MailInput) {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log('[email skipped] SMTP is not configured:', subject, to);
      return { skipped: true };
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    });

    return { sent: true };
  } catch (error) {
    console.error('[email failed]', error);
    return { error };
  }
}

function baseTemplate(title: string, content: string) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a">
      <div style="max-width:620px;margin:auto;background:#ffffff;border-radius:18px;padding:28px;border:1px solid #e2e8f0">
        <h2 style="margin:0 0 12px;color:#047857">${title}</h2>
        ${content}
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
        <p style="font-size:12px;color:#64748b;margin:0">SVN Infra & Solar Service Pvt Ltd<br/>This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `;
}

export function registrationPendingEmail(student: any) {
  return {
    subject: `Registration submitted: ${student.registrationId}`,
    html: baseTemplate(
      'Registration Submitted - Payment Pending Verification',
      `<p>Dear <b>${student.fullName}</b>,</p>
       <p>Your registration has been submitted successfully. Your manual payment proof is pending admin verification.</p>
       <p style="background:#ecfdf5;padding:14px;border-radius:12px"><b>Registration ID:</b> ${student.registrationId}<br/><b>Payment Status:</b> Pending</p>
       <p>You will receive another email after payment approval/rejection.</p>`
    )
  };
}

export function paymentApprovedEmail(student: any) {
  return {
    subject: `Payment approved - Registration ${student.registrationId}`,
    html: baseTemplate(
      'Payment Successful & Registration Confirmed',
      `<p>Dear <b>${student.fullName}</b>,</p>
       <p>Your payment is successful and your registration has been confirmed.</p>
       <p style="background:#ecfdf5;padding:14px;border-radius:12px"><b>Registration ID:</b> ${student.registrationId}<br/><b>Payment Status:</b> Verified<br/><b>Payment ID/UTR:</b> ${student.paymentId || student.utrNumber || 'N/A'}</p>
       <p>Please keep your registration ID safe for future reference.</p>`
    )
  };
}

export function paymentRejectedEmail(student: any) {
  return {
    subject: `Payment rejected - Registration ${student.registrationId}`,
    html: baseTemplate(
      'Payment Verification Rejected',
      `<p>Dear <b>${student.fullName}</b>,</p>
       <p>Your submitted payment proof could not be verified by admin.</p>
       <p style="background:#fff1f2;padding:14px;border-radius:12px"><b>Registration ID:</b> ${student.registrationId}<br/><b>Payment Status:</b> Rejected<br/><b>Reason:</b> ${student.rejectionReason || 'Rejected by admin'}</p>
       <p>Please contact administration with correct UTR/transaction details.</p>`
    )
  };
}
