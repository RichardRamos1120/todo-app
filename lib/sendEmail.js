import Mailjet from 'node-mailjet';

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

const sendEmail = async (from, to, subject, text) => {
    console.log('sendEmail function called');
    try {
        const result = await mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: from,
                            Name: "Todo App"
                        },
                        To: [
                            {
                                Email: to,
                                Name: "Recipient"
                            }
                        ],
                        Subject: subject,
                        TextPart: text
                    }
                ]
            });
        console.log('Email sent successfully:', result.body);
    } catch (err) {
        console.error('Error sending email:', err.statusCode, err.message);
    }
};

export default sendEmail;
