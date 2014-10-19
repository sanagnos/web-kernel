// ============================================================================
// server/calc-basic.js
// ============================================================================
// 
// Calculator for dummies.
// 
// Copyright (c) 2014, Stelios Anagnostopoulos (stelios@outlook.com)
// All rights reserved.
// ============================================================================

'use strict';

// ============================================================================
// Exports
// ============================================================================

module.exports = {

    namespace: 'CalcBasic',

    add: function(a, b, res) {

        res.send('calc-basic> calculating...');
        
        setTimeout(function() {
            res.done('calc-basic> ' + parseInt(a + b));
        }, 100);
    }
};