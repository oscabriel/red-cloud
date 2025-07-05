interface VerificationCodeEmailProps {
	otp: string;
}

interface DeleteAccountEmailProps {
	url: string;
	token: string;
}

interface WorkspaceInvitationEmailProps {
	invitationUrl: string;
	organizationName: string;
	inviterName: string;
	inviterEmail: string;
}
export function VerificationCodeEmail({ otp }: VerificationCodeEmailProps) {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Your verification code: ${otp}</title>
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #ffffff; margin: 0; padding: 20px; }
		.container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; }
		.heading { font-size: 24px; font-weight: 600; margin: 0 0 20px 0; color: #333333; }
		.text { font-size: 16px; margin: 0 0 16px 0; color: #333333; }
		.code-container { text-align: center; margin: 20px 0; }
		.code { font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 6px; margin: 0; display: inline-block; }
		.footer { margin-top: 30px; text-align: center; }
		.footer-text { font-size: 14px; color: #666666; margin: 0; }
	</style>
</head>
<body>
	<div class="container">
		<div>
			<div class="heading">Hi!</div>
			<div class="text">Please use the following code to verify your account:</div>
			<div class="code-container">
				<div class="code">${otp}</div>
			</div>
			<div class="text">This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.</div>
		</div>
		<div class="footer">
			<div class="footer-text">Best regards,<br>Red ☁️</div>
		</div>
	</div>
</body>
</html>`;
}

export function DeleteAccountEmail({ url, token }: DeleteAccountEmailProps) {
	const deleteUrl = `${url}?token=${token}`;

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Confirm account deletion</title>
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #ffffff; margin: 0; padding: 20px; }
		.container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; }
		.heading { font-size: 24px; font-weight: 600; margin: 0 0 20px 0; color: #333333; }
		.text { font-size: 16px; margin: 0 0 16px 0; color: #333333; }
		.button-container { text-align: center; margin: 30px 0; }
		.button { background-color: #dc2626; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 600; font-size: 16px; }
		.button:visited { color: #ffffff !important; }
		.button:hover { color: #ffffff !important; }
		.footer { margin-top: 30px; text-align: center; }
		.footer-text { font-size: 14px; color: #666666; margin: 0; }
	</style>
</head>
<body>
	<div class="container">
		<div>
			<div class="heading">Hi!</div>
			<div class="text">We received a request to delete your account. To confirm this action, please click the button below:</div>
			<div class="button-container">
				<a href="${deleteUrl}" class="button">Delete Account</a>
			</div>
			<div class="text">If you didn't request this action, you can safely ignore this email.</div>
		</div>
		<div class="footer">
			<div class="footer-text">Best regards,<br>Red ☁️</div>
		</div>
	</div>
</body>
</html>`;
}

export function WorkspaceInvitationEmail({
	organizationName,
	inviterName,
	inviterEmail,
	invitationUrl,
}: WorkspaceInvitationEmailProps) {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">	
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Invitation to join ${organizationName}</title>
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #ffffff; margin: 0; padding: 20px; }
		.container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; }
		.heading { font-size: 24px; font-weight: 600; margin: 0 0 20px 0; color: #333333; }
		.text { font-size: 16px; margin: 0 0 16px 0; color: #333333; }
		.button-container { text-align: center; margin: 30px 0; }
		.button { background-color: #dc2626; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 600; font-size: 16px; }
		.button:visited { color: #ffffff !important; }		
		.footer { margin-top: 30px; text-align: center; }
		.footer-text { font-size: 14px; color: #666666; margin: 0; }
	</style>
</head>
<body>
	<div class="container">
		<div>
			<div class="heading">Hi!</div>
			<div class="text">${inviterName} (${inviterEmail}) has invited you to join ${organizationName} on Red Cloud. To accept this invitation, please click the button below:</div>
			<div class="button-container">
				<a href="${invitationUrl}" class="button">Accept Invitation</a>
			</div>
			<div class="text">If you don't want to join this workspace, you can safely ignore this email. This invitation will expire in 48 hours.</div>
		</div>
		<div class="footer">
			<div class="footer-text">Best regards,<br>Red ☁️</div>
		</div>
	</div>
</body>
</html>`;
}
