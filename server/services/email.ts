import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const EMAIL_ENABLED = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = EMAIL_ENABLED
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: parseInt(process.env.SMTP_PORT || "465") === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!EMAIL_ENABLED || !transporter) {
    console.log(`[Email] Would send email to ${options.to}: ${options.subject}`);
    return true;
  }
  
  try {
    console.log(`[Email] Sending email to ${options.to}: ${options.subject}`);
    await transporter.sendMail({
      from: `"RevitaHub" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`[Email] Successfully sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return false;
  }
}

export async function sendPurchaseConfirmation(
  email: string,
  propertyName: string,
  tokenCount: number,
  amount: number
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Purchase Confirmed - ${tokenCount} tokens in ${propertyName}`,
    html: `
      <h1>Purchase Confirmed</h1>
      <p>Thank you for your investment in community revitalization!</p>
      <p><strong>Property:</strong> ${propertyName}</p>
      <p><strong>Tokens:</strong> ${tokenCount}</p>
      <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
      <p>Your tokens have been added to your portfolio. You can view them in your investor dashboard.</p>
    `,
  });
}

export async function sendRefundNotification(
  email: string,
  propertyName: string,
  refundAmount: number,
  interestAmount: number
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Refund Processed - ${propertyName}`,
    html: `
      <h1>Refund Processed</h1>
      <p>The funding goal for ${propertyName} was not met within the deadline.</p>
      <p>As per our investor protection policy, your investment has been refunded with 3% APR interest.</p>
      <p><strong>Original Investment:</strong> $${(refundAmount - interestAmount).toFixed(2)}</p>
      <p><strong>Interest (3% APR):</strong> $${interestAmount.toFixed(2)}</p>
      <p><strong>Total Refund:</strong> $${refundAmount.toFixed(2)}</p>
    `,
  });
}

export async function sendProposalNotification(
  email: string,
  proposalTitle: string,
  propertyName: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `New Proposal - ${proposalTitle}`,
    html: `
      <h1>New Governance Proposal</h1>
      <p>A new proposal has been submitted for ${propertyName}:</p>
      <h2>${proposalTitle}</h2>
      <p>As a token holder, you can vote on this proposal in the governance section.</p>
    `,
  });
}

export async function sendVoteConfirmation(
  email: string,
  proposalTitle: string,
  voteDirection: boolean,
  votingPower: number
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Vote Recorded - ${proposalTitle}`,
    html: `
      <h1>Vote Recorded</h1>
      <p>Your vote has been recorded:</p>
      <p><strong>Proposal:</strong> ${proposalTitle}</p>
      <p><strong>Your Vote:</strong> ${voteDirection ? "For" : "Against"}</p>
      <p><strong>Voting Power Used:</strong> ${votingPower}</p>
    `,
  });
}

export async function sendPhaseAdvancementNotification(
  email: string,
  propertyName: string,
  newPhase: string,
  tokenCount: number
): Promise<boolean> {
  const phaseLabels: Record<string, string> = {
    county: "County",
    state: "State",
    national: "National",
    international: "International",
  };
  return sendEmail({
    to: email,
    subject: `Phase Update - ${propertyName} now in ${phaseLabels[newPhase] || newPhase} phase`,
    html: `
      <h1>Offering Phase Update</h1>
      <p>The token offering for <strong>${propertyName}</strong> has advanced to the <strong>${phaseLabels[newPhase] || newPhase}</strong> phase.</p>
      <p>You currently hold <strong>${tokenCount}</strong> tokens in this property.</p>
      <p>New investors from a wider geographic area can now participate, which may increase demand and funding progress.</p>
      <p>Visit your investor dashboard to view the latest offering details.</p>
    `,
  });
}

const ADMIN_EMAIL = "DEmery@buildourcommunity.co";

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendWaitlistNotification(
  subscriberEmail: string,
  role: string,
  message?: string
): Promise<boolean> {
  const roleLabels: Record<string, string> = {
    investor: "Investor",
    property_owner: "Property Owner",
    community_member: "Community Member",
    other: "Other"
  };
  
  const sanitizedMessage = message?.trim();
  const messageSection = sanitizedMessage 
    ? `<p><strong>Message:</strong></p><blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0; color: #555;">${escapeHtml(sanitizedMessage)}</blockquote>` 
    : "";
  
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Waitlist Signup - ${roleLabels[role] || role}`,
    html: `
      <h1>New Waitlist Signup</h1>
      <p>Someone just joined the RevitaHub beta waitlist!</p>
      <p><strong>Email:</strong> ${subscriberEmail}</p>
      <p><strong>Interest:</strong> ${roleLabels[role] || role}</p>
      ${messageSection}
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `,
  });
}
