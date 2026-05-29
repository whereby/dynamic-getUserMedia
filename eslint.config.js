"use strict";

const globals = require("globals");

module.exports = [
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            "no-console": "off",
            quotes: ["error", "double"],
            semi: ["error", "always"],
        },
    },
];
