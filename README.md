web-kernel
==========

Now part of [comjs](https://github.com/sanagnos/comjs); usage similar but not equivalent to comjs.

## Usage
Some snippets from examples/stencil/*.

### Async modules
#### Declaration
```javascript
// examples/stencil/client/hi-module.js
client.declare('./hi-module', function() {

    function hi(name) {
        console.log('mod> hi, ' + name);
    };

    return {
        hi: hi
    };
});

```
#### Invocation
```javascript
// examples/stencil/client/index.html
client.invoke('./hi-module', function (mod) {
    mod.hi('dogge');
});
```

### RPC service modules

#### Declaration
```javascript
// examples/stencil/server/calc-basic
module.exports = {

    namespace: 'CalcBasic',

    add: function(a, b, res) {

        res.send('calc-basic> calculating...');
        
        setTimeout(function() {
            res.done('calc-basic> ' + parseInt(a + b));
        }, 10);
    }
};

// examples/stencil/server/calc-pro
module.exports = {
    
    namespace: 'CalcPro',
    
    perms: ['subscriber'],

    add: function(a, b, res) {
        res.done('calc-pro> ' + parseInt(a + b));
    }
};
```
#### Invocation
```javascript
// examples/stencil/client/index.html
client.open('dogge', '1234', function () {

    proxy.CalcBasic.add(1, 2, function (res) {
        console.log(res);

        if (this.done)
            proxy.CalcPro.add(1, 2, function (res) { 
                console.log(res);
            });
    });
});
```
### Request routes

#### Server

```javascript
// examples/stencil/main.js
requests: [
		
	// routing module with a collection of xhr routes
	absPath('./server/routes'),

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
]

// examples/stencil/server/routes.js
module.exports = {
	'/foo': function (req, res) {
		var data = '';
		req.on('data', function (chunk) {
			data += chunk;
		});
		req.on('end', function () {
			res.end('bar, ' + JSON.parse(data).wat);
		});
	}
};
```
#### Client
```javascript
// examples/stencil/client/index.html
client.post('/foo', { wat: 'baz' }, function (res) {
    console.log(res);
});
```

### Static serving
```javascript
// examples/stencil/main.js
clientPath  : absPath('./client'), // working assets
publicPath  : absPath('./public'), // assets accessed by clients
minifyClient: true                 // code in the publicPath is minified
```
