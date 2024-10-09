import { mailtrapClient, sender } from "../lib/mailtrap.js"
import { createCommentNotificationEmailTemplate, createWelcomeEmailTemplate } from "./emailTemplates.js"


export const sendWelcomeEmail = async (email, name, profileUrl) => {
    const recipient = [{ email }]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to UnLinked",
            html: createWelcomeEmailTemplate(name, profileUrl),
            category: "Welcome Email"
        })

        console.log("Welcome Email sent successfully", response)
    } catch (error) {
        throw error;
    }
}

export const sendCommentNotificationEmail = async (
    recipientEmail, recipientName, commenterName, postUrl, commentContent
) => {
    const recipient = [{ email: recipientEmail }]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: `New Comment on Your Post: ${postUrl}`,
            html: createCommentNotificationEmailTemplate(recipientName, commenterName, postUrl, commentContent),
            category: "Comment_notification"
        })

        console.log("Comment Notification Email sent successfully", response)
    }
    catch (error) {
        throw new Error(error);
    }
}

export const sendConnectionAcceptedEmail = async (senderEmail, senderName, recipientName, profileUrl) => {
    const recipient = [{ email: senderEmail }];

	try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: `${recipientName} accepted your connection request`,
			html: createConnectionAcceptedEmailTemplate(senderName, recipientName, profileUrl),
			category: "connection_accepted",
		});
	} catch (error) {
        throw new Error(error);
    }
};