// ============================================================================
// server/calc-pro.js
// ============================================================================
// 
// Calculator for pros.
// 
// Copyright (c) 2014, Stelios Anagnostopoulos (stelios@outlook.com)
// All rights reserved.
// ============================================================================

'use strict';

// ============================================================================
// Exports
// ============================================================================

module.exports = {
    
    namespace: 'CalcPro',
    
    perms: ['subscriber'],

    add: function(a, b, res) {
        res.done('calc-pro> ' + parseInt(a + b));
    }
};
