const { defineConfig } = require("@vue/cli-service");
const path = require("path");

module.exports = defineConfig({
	"transpileDependencies": true,
	configureWebpack(config) {
		config.resolve.alias["lithophane_generator_wasm"] = path.resolve(__dirname, "../lithophane-generator/pkg");

		config.experiments ??= {};
		config.experiments.asyncWebAssembly = true;
	},
	"pages": {
		"index": {
			"entry": "src/main.ts",
			"title": "Lithophane Generator",
		}
	}
});
