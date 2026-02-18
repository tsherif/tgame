const js = require("@eslint/js");
const globals = require("globals");

module.exports = [{
    files: ["src/*.js"],
    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",
        globals: {
            ...globals.browser,
            tgame: "readonly"
        }
    },
    rules: {
        ...js.configs.recommended.rules,
        eqeqeq: [ "error", "always"],
        curly: ["error", "all"],
        "no-undef": "error",
        "no-unused-vars": [ "warn", { args: "none" }],
        "no-var": "off",
        "prefer-const": "off",
        indent: ["error", 2, { SwitchCase: 1 }],
        "no-trailing-spaces": "error"
    }
}];


