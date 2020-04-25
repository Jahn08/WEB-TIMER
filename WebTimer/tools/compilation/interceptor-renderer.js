// const PrerenderSpaPlugin = require('prerender-spa-plugin');
// const config = require('./config');

// class RendererInterceptor extends PrerenderSpaPlugin.PuppeteerRenderer {
//     constructor(options) { super(options); }

//     async handleRequestInterception(page) {
//         await page.setRequestInterception(true);
    
//         page.on('request', req => {
//             if (req.method() !== 'GET')
//                 return req.continue();

//             const url = req.url();

//             if (url.endsWith('/modules/about'))
//                 req.respond({
//                     body: JSON.stringify({
//                         email: config.mail.auth.user,
//                         website: config.about.website
//                     })
//                 });

//             // app.get('/modules/about', (req, resp) => {
//             //     resp.json(JSON.stringify({
//             //         email: config.mail.auth.user,
//             //         website: config.about.website
//             //     }));
//             // });

//             req.continue();
//         });
//     }
// }

// module.exports = { RendererInterceptor };
