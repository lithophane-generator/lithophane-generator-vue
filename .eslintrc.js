module.exports = {
	"root": true,
	"env": {
		"node": true,
	},
	"extends": [
		"plugin:vue/vue3-essential",
		"@vue/standard",
		"@vue/typescript/recommended",
	],
	"parserOptions": {
		"ecmaVersion": 2020,
	},
	"rules": {
		"no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
		"no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
		"indent": ["error", "tab"],
		"vue/html-indent": ["error", "tab"],
		"linebreak-style": ["error", "unix"],
		"quotes": ["error", "double"],
		"semi": ["error", "always"],
		"comma-dangle": ["error", "always-multiline"],
		"no-tabs": "off",
		"quote-props": ["error", "always"],
		"space-before-function-paren": ["error", "never"],
		"space-infix-ops": "off",
		"operator-linebreak": ["error", "before"],
	},
};
