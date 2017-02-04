var chalk = require('chalk');
module.exports = {
    "envs": [
        "browser",
        "commonjs",
        "node",
        "jquery"
    ],
    "globals":[
        'SPA', 'WeixinJsBridge'
    ],
    // "ecmaFeatures": {
    //     "modules": true
    // },
    "extends": "eslint:recommended",
    "rules": {
        "indent": ["error", 4],
        // "semi": ["error", "always"],
        // "quotes": ["error", "single"],
        // "no-console": ["error"],
        "linebreak-style": ["error", "unix"]
    }
};