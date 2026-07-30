import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-2",
});

export async function sendPasswordResetEmail({ recipientEmail, resetLink }) {
  const senderEmail = process.env.SES_FROM_EMAIL?.trim();

  // Keep local development simple:
  // if no sender is configured, print the reset link to the terminal.
  if (!senderEmail) {
    console.log("Password reset link:", resetLink);
    return;
  }

  const command = new SendEmailCommand({
    Source: senderEmail,

    Destination: {
      ToAddresses: [recipientEmail],
    },

    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: "Reset your MediaVault password",
      },

      Body: {
        Text: {
          Charset: "UTF-8",
          Data: [
            "You requested a password reset for your MediaVault account.",
            "",
            `Reset your password: ${resetLink}`,
            "",
            "This link expires in 30 minutes.",
            "",
            "If you did not request a password reset, you can ignore this email.",
          ].join("\n"),
        },

        Html: {
          Charset: "UTF-8",
          Data: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172117;">
              <h1 style="margin-bottom: 16px;">Reset your MediaVault password</h1>

              <p>
                You requested a password reset for your MediaVault account.
              </p>

              <p style="margin: 24px 0;">
                <a
                  href="${resetLink}"
                  style="
                    display: inline-block;
                    padding: 12px 20px;
                    background-color: #4b8508;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                  "
                >
                  Reset Password
                </a>
              </p>

              <p>This link expires in 30 minutes.</p>

              <p>
                If you did not request a password reset, you can ignore this email.
              </p>
            </div>
          `,
        },
      },
    },
  });

  await sesClient.send(command);
}
