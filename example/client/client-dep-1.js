client.declare('./client-dep-1', function() {

    function sayHi(name) {
        console.log('dep1> this is #1 saying hi, ' + name);
    };

    return {
        sayHi: sayHi
    };
})