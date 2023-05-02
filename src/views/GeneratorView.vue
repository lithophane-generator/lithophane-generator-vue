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
				@updatePreview="generatePreview(100)"
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
	flex-direction: column;
	gap: 1em;

	> ::v-deep(*) {
		flex: 1 1 0;
		min-width: 0;
	}

	.model-viewer {
		min-height: calc(100vh - var(--nav-element-spacing-vertical) * 2 - 64px - var(--spacing) * 2);
	}

	@media (min-aspect-ratio: 3/2) {
		flex-direction: row;
		max-height: calc(100vh - var(--nav-element-spacing-vertical) * 2 - 64px - var(--spacing) * 2);
		.settings {
			overflow-y: auto;
		}
	}
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import GeneratorSettings from "@/components/GeneratorSettings.vue";
import StlViewer from "@/components/StlViewer.vue";
import { assert } from "@/util";
import { ColorRepresentation } from "three";

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

			"wasm": null as typeof import("lithophane_generator_wasm/lithophane_generator")|null,
			"lithophane": null as Uint8Array|null,
			// Expressions used to generate the most recent lithophane (used to check if we should show a preview or the lithophane)
			"generated_expressions": null as [string, string, string]|null,
			"preview": null as Uint8Array|null,
		};
	},
	"computed": {
		previewWidth(): number {
			return typeof this.imageWidth !== "undefined" ? this.imageWidth : 500;
		},
		previewHeight(): number {
			return typeof this.imageHeight !== "undefined" ? this.imageHeight : 500;
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
		showLithophane(): boolean { // TODO on change instead of input
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
						this.generatePreview(100);
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
			} catch (e) {
				console.error(e);
			}
		},
		generatePreview(resolution: number): void {
			this.preview = null;
			if (this.wasm === null) {
				return;
			}

			// Preview step tells it to step by n vertices so that the preview is lower resolution and generates faster.
			// Calculate it so that the preview will be at most 100x100 vertices
			const previewStep = Math.ceil(Math.max(this.previewWidth, this.previewHeight) / resolution);

			try {
				this.preview = this.wasm.generate_preview(
					this.xExpression,
					this.yExpression,
					this.zExpression,
					this.previewWidth,
					this.previewHeight,
					previewStep,
				);
			} catch (e) {
				// TODO show previous preview as red
				console.error(e);
			}
		},
	},
	"watch": {
		xExpression(): void {
			this.generatePreview(20);
		},
		yExpression(): void {
			this.generatePreview(20);
		},
		zExpression(): void {
			this.generatePreview(20);
		},
	},
	mounted(): void {
		import("lithophane_generator_wasm/lithophane_generator").then(wasm => {
			wasm.init();
			this.wasm = wasm;
			this.generatePreview(100);
		}).catch(console.error);
	},
});
</script>
