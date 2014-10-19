client.declare('./client-dep-2', function() {

    function sayHi(name) {
        console.log('dep2> this is #2 saying hi, ' + name);
    };

    return {
        sayHi: sayHi
    };
});