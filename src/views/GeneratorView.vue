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

			<label>
				File Size:
				<input disabled :value="lithophaneSize === null ? null : prettyBytes(lithophaneSize)">
			</label>

			<div class="generator-btns">
				<button type="button" @click="generateLithophane">Generate Lithophane</button>
				<a v-if="showLithophane && lithophaneUrl !== null" role="button" :href="lithophaneUrl" download="lithophane.stl">
					Download Lithophane
				</a>
				<button v-else type="button" disabled>Download Lithophane</button>
			</div>
		</div>

		<StlViewer
			class="model-viewer"
			:stl="stlModel"
			:color="stlColor"
			:doubleSided="stlDoubleSided"
		/>
	</div>

	<ModalWindow v-if="showSizeWarningModal" @close="showSizeWarningModal = false">
		<template #title>
			Large Image
		</template>
		<template #body>
			Large images can cause the lithophane to take much longer to generate, and can increase the STL file size significantly. Using higher
			resolution images for lithophanes quickly runs into diminishing returns, since 3D printers can only achieve so much detail. Consider
			lowering the resolution of your image before using it to generate a lithophane.
		</template>
	</ModalWindow>
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

	@media (min-aspect-ratio: 3/2) {
		flex-direction: row;
		max-height: calc(100vh - var(--nav-element-spacing-vertical) * 2 - 64px - var(--spacing) * 2);
		.settings {
			overflow-y: auto;
		}
	}
}

.model-viewer {
	min-height: calc(100vh - var(--nav-element-spacing-vertical) * 2 - 64px - var(--spacing) * 2);
}

.generator-btns {
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
import ModalWindow from "@/components/ModalWindow.vue";
import { assert } from "@/util";
import { ColorRepresentation } from "three";
import prettyBytes from "pretty-bytes";

export default defineComponent({
	"components": {
		GeneratorSettings,
		StlViewer,
		ModalWindow,
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

			"showSizeWarningModal": false,

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
		lithophaneUrl(): string|null {
			if (this.lithophane === null) {
				return null;
			}
			return URL.createObjectURL(new Blob([this.lithophane], { "type": "application/sla" }));
		},
		lithophaneSize(): number|null {
			if (typeof this.imageWidth === "undefined" || typeof this.imageHeight === "undefined") {
				return null;
			}

			const h = this.imageWidth - 1;
			const v = this.imageHeight - 1;

			return (
				(h * v) * 2 // front and back squares
				+ h * 2 // top and bottom side squares
				+ v * 2 // left and right side squares
			) * 2 * 50 + 84; // double squares into trianges, 50 bytes per triangle, 84 byte header
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
						if (this.imageWidth * this.imageHeight > 1000000) {
							this.showSizeWarningModal = true;
						}
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
		prettyBytes,
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
