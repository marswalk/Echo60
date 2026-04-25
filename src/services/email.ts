const RESEND_API_KEY = "re_123456789"; // Ideally from .env

export const sendLetterEmail = async (email: string, letterBody: string) => {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "Your Future Self <futureself@echo60.app>", // Requires domain verification in Resend
        to: email,
        subject: "A message from your future",
        html: `<div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                <p>${letterBody.replace(/\n/g, '<br>')}</p>
              </div>`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};
