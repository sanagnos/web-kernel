web-kernel
==========

> RPC-based AMD client-server middleware

Modular RPC abstraction for client/server systems over WebSockets & XHR in end-to-end Javascript.

The goal is to consolidate fragmented workflows to a consistent API engineered around laconic & frinctionless development: using the minimum necessary number of steps to get something done and aiming for the maximum possible performance, in both memory & computation.

The scope of the functionality falls under four recurring tasks:

- file serving
- request routing
- async module loading
- client-server rpc

This is an open-source component of an [experiment](http://www.nesi.io) with an impossible enough goal to be an obsession.

## Getting started

To use make sure you have [node](http://www.nodejs.org) installed, and point your terminal to the directory
```
> cd ./web-kernel
```

To setup dependencies
```
> npm install
```

To run the example
```
> node example/main
> chrome localhost
```

## API

### Server

#### `init(config[, cb])`
Starts up server on given configurations.

##### args
###### `config`

| config properties | types           | about                                                                                        |
| ----------------- | --------------- | -------------------------------------------------------------------------------------------- |
| port              | Number          | http connection port                                                                         |
| requests          | Array           | paths to request modules or direct { namespace, perms, taskFoo } entries                     |
| services          | Array           | paths to service modules or direct { namespace, perms, taskFoo } entries                     |
| authServices      | Function        | auth handler (passed client-side auth params, it propagates set of allowed rpc service perms to callback) |
| clientPath        | String          | directory of client source files                                                             |
| publicPath        | String          | static directory where client files are copied over                                          |
| minifyClient      | Boolean         | if true, minifies code in publicPath                                                         |

###### `cb`
Callback to entry point after successful server initialization.

### Client

#### `open([[usr, [pwd, [email]]], cb])`
Connects to server endpoint, delegating to callback when done. 

If authServices handles authentication, this is the client entry-point to pass in the credentials & get the proper permissions to RPC modules.

#### `close()`
Closes connection.

#### `declare(name, [dependencies,] module)`
Declares AMD module (usable with `invoke`).

Any dependencies are passed as arguments to the module handler.

#### `invoke(name/names, cb)`
Invokes modules to client, passing instances to callback in the order supplied.

#### `get(route, [data,] cb)`
Get request xhr utility.

#### `post(route, data, cb)`
Post request xhr utility.

## Usage
Some snippets from example/*.

### Async modules
#### Declaration
```javascript
// example/client/hi-module.js
client.declare('./hi-module', function() {

    function hi(name) {
        console.log('mod> hi, ' + name);
    };

    return {
        hi: hi
    };
});

```
#### Invocation (client-side)
```javascript
// example/client/index.html
client.invoke('./hi-module', function (mod) {
    mod.hi('dogge');
});
```

### RPC service modules

#### Declaration
```javascript
// example/server/calc-basic
module.exports = {

    namespace: 'CalcBasic',

    add: function(a, b, res) {

        res.send('calc-basic> calculating...');
        
        setTimeout(function() {
            res.done('calc-basic> ' + parseInt(a + b));
        }, 10);
    }
};

// example/server/calc-pro
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
// example/client/index.html
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
// example/main.js
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

// example/server/routes.js
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
// example/client/index.html
client.post('/foo', { wat: 'baz' }, function (res) {
    console.log(res);
});
```

### Static serving
```javascript
// example/main.js
clientPath  : absPath('./client'), // working assets
publicPath  : absPath('./public'), // assets accessed by clients
minifyClient: true                 // code in the publicPath is minified
```
## Design
Each of the four functional areas scoped have been designed with the following principles in mind.

### File serving
Manually enumerating client files isn't compatible to agile prototyping.

Write code in the `clientPath` source directory, and replicate it in the static `publicPath` directory.

The static js files can optionally be minified to optimize for bandwidth (see `minifyClient`).

### Request routing
Use a single entrypoint for routes and support both declarative & modular registrations.

Register either by module exporting `/route` - `hander(req,res)` key-value pairs or declarativelly on initialization by adding an object of valid key-value pairs to the `requests` list.

### Async module loading
Declaration & invocation as the two core flows to optimize around; everything else (dependency injection, minification, etc should be handled in parameters).

### Client-server RPC
Use a single entrypoint for RPC modules and support both declarative & modular registrations.

Generalize authentication to a configurable permissions-based model.

Register either by module exporting `namespace` & `perms` (optionally), along with the function declarations, or declaratively by including an analogous object to the `services` list.

## Bugs
Possibly lurking. I'm actively working with this, so any fixes should make it here quickly.

## License
Feel free to use non-commercially, but drop me a line for anything but for the sake of ~~yin-yang~~ win-win.

## Changelog
* 0.0.1 -- First commit; redesign from older codebase.
