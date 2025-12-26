interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const EMAIL_ENABLED = !!process.env.SMTP_HOST;

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!EMAIL_ENABLED) {
    console.log(`[Email] Would send email to ${options.to}: ${options.subject}`);
    return true;
  }
  
  try {
    console.log(`[Email] Sending email to ${options.to}: ${options.subject}`);
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

const ADMIN_EMAIL = "DEmery@buildourcommunity.co";

export async function sendWaitlistNotification(
  subscriberEmail: string,
  role: string
): Promise<boolean> {
  const roleLabels: Record<string, string> = {
    investor: "Investor",
    property_owner: "Property Owner",
    community_member: "Community Member",
    other: "Other"
  };
  
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Waitlist Signup - ${roleLabels[role] || role}`,
    html: `
      <h1>New Waitlist Signup</h1>
      <p>Someone just joined the RevitaHub beta waitlist!</p>
      <p><strong>Email:</strong> ${subscriberEmail}</p>
      <p><strong>Interest:</strong> ${roleLabels[role] || role}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `,
  });
}
