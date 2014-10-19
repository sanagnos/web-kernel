var initKernel = require('../../init'),
    join       = require('path').join;

initKernel({

    // http connection port
    port: 80,

    // http request registration
    requests: [

        // direct definitions
        {
            // redirect '/' to '/index.html'
            '/' : function (req, res) {
                res.writeHead(301, {
                    'location': '/index.html'
                });
                res.end();
            }
        }
    ],

    // client build settings
    clientPath  : absPath('./client'),
    publicPath  : absPath('./public'),
    minifyClient: true

}, function () {
    console.log('server running');
});

// ============================================================================
// Internal
// ============================================================================

function absPath (path) { return join(__dirname, path) };
