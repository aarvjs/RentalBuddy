import sgMail from "@sendgrid/mail";

export interface SendConnectionOtpEmailInput {
  customerEmail: string;
  customerName?: string;
  serviceName: string;
  providerName: string;
  providerPhone?: string;
  date: string;
  time: string;
  duration?: string;
  amount?: number;
  connectionOtp: string;
  expiresAtHours?: number;
}

export async function sendConnectionOtpEmail(input: SendConnectionOtpEmailInput): Promise<boolean> {
  const currentApiKey = process.env.SENDGRID_API_KEY;
  const senderEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!currentApiKey || !currentApiKey.trim()) {
    console.error(
      "[SENDGRID CONFIG ERROR]: Missing SENDGRID_API_KEY in environment variables (.env.local)."
    );
    throw new Error("SENDGRID_API_KEY environment variable is missing.");
  }

  if (!senderEmail || !senderEmail.trim()) {
    console.error(
      "[SENDGRID CONFIG ERROR]: Missing SENDGRID_FROM_EMAIL in environment variables (.env.local)."
    );
    throw new Error("SENDGRID_FROM_EMAIL environment variable is missing.");
  }

  sgMail.setApiKey(currentApiKey.trim());

  const {
    customerEmail,
    customerName = "Valued Customer",
    serviceName,
    providerName,
    providerPhone = "Will be provided by partner",
    date,
    time,
    connectionOtp,
    expiresAtHours = 24,
  } = input;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFF9FA; margin: 0; padding: 20px; color: #3b0764; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #fbcfe8; box-shadow: 0 10px 25px rgba(236,72,153,0.1); }
          .header { background: linear-gradient(135deg, #ec4899 0%, #9333ea 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
          .content { padding: 32px 28px; }
          .badge { display: inline-block; background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; margin-bottom: 20px; }
          .info-box { background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 16px; padding: 20px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
          .info-label { font-weight: 600; color: #701a75; }
          .info-val { font-weight: 800; color: #3b0764; }
          .otp-box { background: linear-gradient(135deg, #fdf2f8 0%, #faf5ff 100%); border: 2px dashed #ec4899; border-radius: 20px; text-align: center; padding: 24px; margin: 24px 0; }
          .otp-code { font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #be185d; margin: 10px 0; }
          .note { font-size: 12px; color: #86198f; line-height: 1.6; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #a21caf; border-top: 1px solid #fbcfe8; background-color: #faf5ff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RentasBuddy</h1>
            <p>Your Social Companion Platform</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <span class="badge">Booking Confirmed ✓</span>
            </div>
            <h2 style="margin-top:0; font-size: 20px; font-weight: 800;">Hello ${customerName},</h2>
            <p style="font-size: 14px; line-height: 1.5;">Your service booking has been successfully confirmed. Below are your booking details and your unique Service Connection Code.</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Service:</span>
                <span class="info-val">${serviceName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Provider:</span>
                <span class="info-val">${providerName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-val">${date}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Time:</span>
                <span class="info-val">${time}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Provider Contact:</span>
                <span class="info-val" style="color: #ec4899;">${providerPhone}</span>
              </div>
            </div>

            <div class="otp-box">
              <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #701a75;">Your Service Connection Code</div>
              <div class="otp-code">${connectionOtp}</div>
              <div style="font-size: 11px; color: #9d174d; font-weight: 600;">Valid for ${expiresAtHours} hours</div>
            </div>

            <div class="note">
              <strong>Important Instructions:</strong>
              <ul>
                <li>Please share this 6-digit connection code with your Service Provider when you meet.</li>
                <li>This code is required by the provider to verify and activate your service connection.</li>
                <li>Do not share this code with anyone other than your selected Service Provider.</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} RentasBuddy. All rights reserved. Safe & Confidential Service Experience.
          </div>
        </div>
      </body>
    </html>
  `;

  const msg = {
    to: customerEmail,
    from: {
      email: senderEmail.trim(),
      name: "RentasBuddy",
    },
    subject: `Your RentasBuddy Connection Code (${serviceName})`,
    text: `Your RentasBuddy Connection Code for ${serviceName} with ${providerName} is: ${connectionOtp}. Provider Contact: ${providerPhone}. Share this code when you meet your provider.`,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`[SendGrid Success]: Connection code email sent to customer (${customerEmail}) from RentasBuddy <${senderEmail.trim()}>`);
    return true;
  } catch (error: any) {
    const responseBody = error?.response?.body;
    console.error(
      "[SendGrid Failure]: Email dispatch failed.",
      responseBody ? JSON.stringify(responseBody) : error?.message || error
    );
    return false;
  }
}
