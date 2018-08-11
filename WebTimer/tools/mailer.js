const ResponseError = require('./response-error').ResponseError;
const nodemailer = require('nodemailer');

function Mailer(config, response = null) {
    let respErr;
    
    if (response)
        respErr = new ResponseError(response);

    const appFullUrl = config.server.getFullUrl();
    const mailTransportOptions = config.mail;

    const transport = nodemailer.createTransport(mailTransportOptions);

    const sendMsg = (to, processName, html) => {
        const closing = '<br /><hr /><p>Sincerely yours, the team of Web Timer</p>';

        return new Promise((resolve, reject) => {
            transport.sendMail({
                from: `Web Timer <${mailTransportOptions.auth.user}>`,
                html: html + closing,
                to,
                subject: `Web Timer Account ${processName}`  
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
        const html = `<div>
            <p><b>Dear ${name}</b>, we are happy to welcome you on 
                <a href='${appFullUrl}'>Web Timer</a> where your account has just been created.</p>
            <p>Now you can build your own customised timers for whatever process you need!</p>
            <p>We hope you enjoy your experience here!</p>
        </div>`;

        return sendMsg(to, 'Creation', html);
    };

    this.sendAccountRemovalMsg = function (to, name) {
        const html = `<div>
            <p><b>Dear ${name}</b>, we are sorry to hear that you leave <a href='${appFullUrl}'>Web Timer</a>.</p>
            <p>You account has been deleted.</p>
            <p>We hope to see you soon!</p>
        </div>`;

        return sendMsg(to, 'Removal', html);
    };
};

module.exports = Mailer;