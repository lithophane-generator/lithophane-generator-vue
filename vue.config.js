const { defineConfig } = require("@vue/cli-service");
const path = require("path");

module.exports = defineConfig({
	"transpileDependencies": true,
	configureWebpack(config) {
		config.resolve.alias["lithophane_creator_wasm"] = path.resolve(__dirname, "../lithophane-creator/pkg");

		config.experiments ??= {};
		config.experiments.asyncWebAssembly = true;
	},
});
