client.declare('./hi-module', function() {

    function hi(name) {
        console.log('mod> hi, ' + name);
    };
    
    this.hi = hi;
});
