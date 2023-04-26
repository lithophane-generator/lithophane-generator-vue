<template>
	<div class="generator">
		<div>
			<label>
				Image
				<input type="file" @change="loadFile">
			</label>

			<GeneratorSettings
				v-model:xExpression="xExpression"
				v-model:yExpression="yExpression"
				v-model:zExpression="zExpression"
				:imageWidth="imageWidth"
				:imageHeight="imageHeight"
			/>

			<button type="button" @click="generateLithophane">Generate Lithophane</button>
		</div>

		<StlViewer
			v-if="lithophane !== null"
			class="model-viewer"
			:stl="lithophane"
		/>
		<div v-else class="model-viewer"></div>
	</div>
</template>

<style scoped lang="scss">
.generator {
	display: flex;
	gap: 1em;

	> * {
		flex: 1 1 0;
	}
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import GeneratorSettings from "@/components/GeneratorSettings.vue";
import StlViewer from "@/components/StlViewer.vue";
import { assert } from "@/util";

export default defineComponent({
	"components": {
		GeneratorSettings,
		StlViewer,
	},
	data() {
		return {
			"file": null as File|null,

			"xExpression": "0",
			"yExpression": "x/10",
			"zExpression": "(h-y-1)/10",

			"imageWidth": undefined as number|undefined,
			"imageHeight": undefined as number|undefined,

			"imageData": undefined as Uint8Array|undefined,

			"wasm": null as typeof import("lithophane_creator_wasm/lithophane_creator")|null,
			"lithophane": null as Uint8Array|null,
		};
	},
	"computed": {
		lithophaneUri(): string|null {
			if (this.lithophane === null) {
				return null;
			}
			return URL.createObjectURL(new Blob([this.lithophane], { "type": "application/sla" }));
		},
	},
	"methods": {
		loadFile(e: Event): void {
			if (e.target instanceof HTMLInputElement) {
				if (e.target?.files?.length === 1) {
					this.file = e.target.files[0];

					const reader = new FileReader();
					reader.onerror = (e: Event) => {
						alert(`Error reading file: ${e}`);
						this.file = null;
					};
					reader.onload = (e) => {
						assert(e.target !== null && e.target.result instanceof ArrayBuffer);
						assert(this.wasm !== null);
						this.imageData = new Uint8Array(e.target.result);
						console.log(this.imageData);
						const dimensions = this.wasm.get_image_dimensions(this.imageData);
						this.imageWidth = dimensions.width;
						this.imageHeight = dimensions.height;
					};
					reader.readAsArrayBuffer(this.file);
				} else {
					this.imageWidth = undefined;
					this.imageHeight = undefined;
				}
			}
		},
		generateLithophane(): void {
			if (this.file === null) {
				alert("select a file");
				return;
			}
			if (!this.imageData) {
				alert("file not read");
				return;
			}

			assert(this.wasm !== null);
			// try {
			const lithophane = this.wasm.generate_lithophane(this.xExpression, this.yExpression, this.zExpression, this.imageData, 0.5, 3);
			this.lithophane = lithophane;
			// } catch (e) {
			// 	alert(e);
			// 	console.log(e);
			// }
		},
	},
	mounted(): void {
		import("lithophane_creator_wasm/lithophane_creator").then(wasm => {
			wasm.init();
			this.wasm = wasm;
		}).catch(console.error);
	},
});
</script>
