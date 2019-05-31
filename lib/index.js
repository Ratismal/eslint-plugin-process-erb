/**
 * @fileoverview Pre-processes .ERB files for eslint.
 * @author stupid cat
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var requireIndex = require("requireindex");

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------




// import processors
module.exports.processors = {
    ".erb": require('./processors/processErb')
};

