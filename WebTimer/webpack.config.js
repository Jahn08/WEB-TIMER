const PrerenderSpaPlugin = require('prerender-spa-plugin');

const path = require('path');

const rootPath = __dirname;

const buildDirName = 'client';
const buildPath = path.resolve(rootPath, buildDirName);

const ApiMocker = require('./tools/compilation/api-mocker').ApiMocker;
const apiMockerPlugin = new ApiMocker(buildPath);
const defaultPort = 8000;

const isProduction = process.env.NODE_ENV === 'production';

const DependencyCopier = require('./tools/compilation/dependency-copier').DependencyCopier;
const dependencyCopierPlugin = new DependencyCopier(buildPath, rootPath, isProduction);

const BuildCleaner = require('./tools/compilation/build-cleaner').BuildCleaner;

const viewsDirName = 'views';

module.exports = {
    mode:  isProduction ? process.env.NODE_ENV : 'development',
    entry: './components/component-initialiser.js',
    output: {
        filename: 'app.js',
        path: buildPath,
        publicPath: '/'
    },
    devtool: isProduction ? 'hidden-source-map' : 'cheap-source-map',
    plugins: [new BuildCleaner(buildPath), dependencyCopierPlugin, apiMockerPlugin,
        new PrerenderSpaPlugin({
            staticDir: __dirname,
            outputDir: path.join(buildPath, viewsDirName),
            routes: [ '/stopwatch', '/timer', '/timerCustomised', '/about'],
            indexPath: path.join(rootPath, viewsDirName, 'index.html'),
            server: {
                port: defaultPort,
                proxy: Object.assign(apiMockerPlugin.configureProxy(defaultPort, buildDirName),
                    dependencyCopierPlugin.configureProxy(defaultPort, buildDirName))
            },
            renderer: new PrerenderSpaPlugin.PuppeteerRenderer({
                inject: true,
                renderAfterDocumentEvent: 'render-event'
            })
        })]  
};