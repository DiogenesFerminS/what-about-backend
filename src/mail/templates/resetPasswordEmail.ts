export const resetPasswordEmail = (name: string, url: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #fff; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fff; min-height: 500px;">
        <tr>
            <td align="center" valign="middle" style="padding: 20px 10px;">
                
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #312d2d; border-radius: 16px; overflow: hidden;">
                    <tr>
                        <td style="padding: 30px 25px;">
                            
                            <h1 style="margin: 0 0 20px 0; text-align: center; color: #f2f2f2; font-size: 28px; font-weight: 800;">
                                What - <span style="color: #7c3aed;">About</span>
                            </h1>

                            <p style="margin: 0 0 15px 0; color: #f2f2f2; font-size: 18px; font-weight: 600;">
                                Hello, ${name}
                            </p>
                                  
                            <p style="margin: 0 0 15px 0; color: #f2f2f2; font-size: 15px; line-height: 24px;">
                                We received a request to reset the password for your account. If you made this request, please click the button below to choose a new password:
                            </p>

                            <p style="margin: 0 0 25px 0; color: #f2f2f2; font-size: 14px; font-style: italic; opacity: 0.8;">
                                This link will expire in 1 hour for security reasons.
                            </p>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <a href="${url}" target="_blank" style="display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 0 0; font-size: 13px; text-align: center; color: #d6d6d6; line-height: 18px;">
                                If you didn't ask to reset your password, you can safely ignore this email. Your account is secure.
                            </p>
                             
                            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: #d6d6d6;">
                                    This email was sent automatically, please do not reply.
                                </p>
                            </div>

                        </td>
                    </tr>
                </table>
                </td>
        </tr>
    </table>
</body>
</html>
    `;
};
