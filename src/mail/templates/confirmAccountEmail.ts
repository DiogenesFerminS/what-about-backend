export const confirmAccountEmail = (url: string): string => {
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
                
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #312d2d; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <h1 style="margin: 0 0 20px 0; text-align: center; color: #f2f2f2; font-size: 26px; font-weight: 800;">
                                Welcome to What - <span style="color: #7c3aed;">About</span>
                            </h1>

                            <div style="margin-bottom: 20px; text-align: center;">
                                <p style="margin: 0; color: #f2f2f2; font-size: 18px; font-weight: 500;">
                                    Welcome to our platform. We are thrilled to have you here.
                                </p>
                            </div>
                                  
                            <p style="margin: 0 0 30px 0; color: #f2f2f2; font-size: 15px; line-height: 26px; text-align: center; opacity: 0.9;">
                                To start posting and connecting with others, we need to verify that this email is truly yours. It will only take a second.
                            </p>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <a href="${url}" target="_blank" style="display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);">
                                            Verify My Account
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 40px 0 10px 0; font-size: 13px; text-align: center; color: #d1d1d1; opacity: 0.7;">
                                If you didn't create this account, you can safely ignore this email.
                            </p>
                             
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: #d1d1d1; opacity: 0.5;">
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
