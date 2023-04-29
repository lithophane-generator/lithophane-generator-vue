<template>
	<div class="generator">
		<div class="settings">
			<label>
				Image
				<input type="file" @change="loadFile" accept=".jpeg,.jpg,.png,.gif">
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
			class="model-viewer"
			:stl="stlModel"
			:color="stlColor"
			:doubleSided="stlDoubleSided"
		/>
	</div>
</template>

<style scoped lang="scss">
.generator {
	display: flex;
	gap: 1em;

	> ::v-deep(*) {
		flex: 1 1 0;
		min-width: 0;
	}

	max-height: calc(100vh - var(--nav-element-spacing-vertical) * 2 - 64px - var(--spacing) * 2);
	.settings {
		overflow-y: auto;
	}
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import GeneratorSettings from "@/components/GeneratorSettings.vue";
import StlViewer from "@/components/StlViewer.vue";
import { assert } from "@/util";
import { ColorRepresentation } from "three";
import { Vector3PropInterface } from "troisjs/src/core/Object3D";

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
			// Expressions used to generate the most recent lithophane (used to check if we should show a preview or the lithophane)
			"generated_expressions": null as [string, string, string]|null,
		};
	},
	"computed": {
		// Preview width/height maintains the image aspect ratio but changes the
		// resolution by dividing by preview scale so that the larger dimension is < 100
		previewScale(): number {
			if (typeof this.imageWidth !== "undefined" && typeof this.imageHeight !== "undefined") {
				return Math.max(this.imageWidth, this.imageHeight) / 100;
			}

			return 1;
		},
		previewWidth(): number {
			if (typeof this.imageWidth !== "undefined") {
				return Math.round(this.imageWidth / this.previewScale);
			}

			return 100;
		},
		previewHeight(): number {
			if (typeof this.imageHeight !== "undefined") {
				return Math.round(this.imageHeight / this.previewScale);
			}

			return 100;
		},
		// Actual x scale, different from previewScale due to rounding the width
		previewScaleX(): number {
			return typeof this.imageWidth !== "undefined" ? this.imageWidth / this.previewWidth : 1;
		},
		// Actual y scale, different from previewScale due to rounding the height
		previewScaleY(): number {
			return typeof this.imageHeight !== "undefined" ? this.imageHeight / this.previewHeight : 1;
		},
		// Whether the expressions have changed since the lithophane was generated
		expressionsChanged(): boolean {
			return (
				this.generated_expressions === null
				|| this.xExpression !== this.generated_expressions[0]
				|| this.yExpression !== this.generated_expressions[1]
				|| this.zExpression !== this.generated_expressions[2]
			);
		},
		preview(): Uint8Array|null {
			if (this.wasm === null) {
				return null;
			}

			try {
				console.log(this.previewScale);
				return this.wasm.generate_preview(this.xExpression, this.yExpression, this.zExpression, this.previewWidth, this.previewHeight, this.previewScaleX, this.previewScaleY);
				// return this.wasm.generate_preview(this.xExpression, this.yExpression, this.zExpression, this.previewWidth, this.previewHeight, 1, 1);
			} catch (e) {
				return null;
			}
		},
		showLithophane(): boolean {
			return this.lithophane !== null && !this.expressionsChanged;
		},
		stlModel(): Uint8Array|null {
			return this.showLithophane ? this.lithophane : this.preview;
		},
		stlColor(): ColorRepresentation {
			return this.showLithophane ? "#ffffff" : "#0000ff";
		},
		stlDoubleSided(): boolean {
			return !this.showLithophane;
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
						const dimensions = this.wasm.get_image_dimensions(this.imageData);
						this.imageWidth = dimensions.width;
						this.imageHeight = dimensions.height;
						dimensions.free();
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
			try {
				const lithophane = this.wasm.generate_lithophane(this.xExpression, this.yExpression, this.zExpression, this.imageData, 0.5, 3);
				this.lithophane = lithophane;
				this.generated_expressions = [this.xExpression, this.yExpression, this.zExpression];
				console.log(this.lithophane);
			} catch (e) {
				alert(e);
				console.log(e);
			}
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
