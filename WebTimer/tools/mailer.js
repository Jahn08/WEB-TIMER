const ResponseError = require('./response-error').ResponseError;
const nodemailer = require('nodemailer');

function Mailer(config, response = null) {
    let respErr;
    
    if (response)
        respErr = new ResponseError(response);

    const appFullUrl = config.server.getFullUrl();
    const mailTransportOptions = config.mail;

    const transport = nodemailer.createTransport(mailTransportOptions);

    const sendMsg = (to, subject, text) => {
        return new Promise((resolve, reject) => {
            transport.sendMail({
                from: mailTransportOptions.auth.user,
                to,
                subject,
                text
            })
            .then(info => resolve(info))
            .catch(err => {
                if (respErr)
                    respErr.respondWithUnexpectedError('Sending email failed: ' + err);

                reject(err);
            });
        });
    };

    this.sendAccountCreationMsg = function (to, name) {
        const text = `<div>
            <b>Dear ${name}</b>, we are happy to welcome you on 
                <a href='${appFullUrl}'>Web Timer</a> where your account has just been created
            <br /> Now you can build your own customised timers for whatever process you need
            <br /> We hope you enjoy your experience there
        </div>`;

        return sendMsg(to, 'Web Timer Account Creation', text);
    };

    this.sendAccountRemovalMsg = function (to) {
        const text = `<div>
            <b>Dear ${name}</b>, we are sorry to hear that you leave <a href='${appFullUrl}'>Web Timer</a>
            <br /> You account has been deleted
            <br /> We hope to see you soon
        </div>`;

        return sendMsg(to, 'Web Timer Account Removal', text);
    };
};

module.exports = Mailer;