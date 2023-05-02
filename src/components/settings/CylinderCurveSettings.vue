<template>
	<fieldset class="horizontal-fieldset">
		<legend>Axis of Rotation:</legend>
		<label>
			<input type="radio" value="x" v-model="axisOfRotation" @change="recalculate" @focusout="$emit('updatePreview')">
			X
		</label>
		<label>
			<input type="radio" value="y" v-model="axisOfRotation" @change="recalculate" @focusout="$emit('updatePreview')">
			Y
		</label>
		<label>
			<input type="radio" value="z" v-model="axisOfRotation" @change="recalculate" @focusout="$emit('updatePreview')">
			Z
		</label>
	</fieldset>

	<label>
		Horizontal Resolution (mm/px):
		<input type="number" v-model="hRes" @input="recalculate" @focusout="$emit('updatePreview')">
	</label>
	<label>
		Vertical Resolution (mm/px):
		<input type="number" v-model="vRes" @input="recalculate" @focusout="$emit('updatePreview')">
	</label>
	<label>
		Arc (degrees): {{ arc }}
		<input type="range" min="1" max="360" v-model="arc" @input="recalculate" @focusout="$emit('updatePreview')">
	</label>

	<label>
		Inner Radius (mm):
		<input type="number" disabled :value="round(radius, 4)">
	</label>
	<label>
		Inner Arc Length (mm):
		<input type="number" disabled :value="round(arcLength, 4)">
	</label>
	<label>
		Inner Width (mm):
		<input type="number" disabled :value="round(width, 4)">
	</label>
	<label>
		Inner Depth (mm):
		<input type="number" disabled :value="round(depth, 4)">
	</label>
	<label>
		Height (mm):
		<input type="number" disabled :value="round(height, 4)">
	</label>
</template>

<style scoped lang="scss">
</style>

<script lang="ts">
import { round } from "@/util";
import { defineComponent, PropType } from "vue";

type Axis = "x"|"y"|"z";

export default defineComponent({
	"props": {
		"imageWidth": { "type": Number as PropType<number> },
		"imageHeight": { "type": Number as PropType<number> },
	},
	data() {
		return {
			"axisOfRotation": "z" as Axis,
			"hRes": 0.1,
			"vRes": 0.1,
			"arc": 120,
			"recalculations": 0,
		};
	},
	activated(): void {
		this.recalculate();
	},
	"computed": {
		firstAxis(): Axis {
			return ({
				"x": "y",
				"y": "z",
				"z": "x",
			} as const)[this.axisOfRotation];
		},
		secondAxis(): Axis {
			return ({
				"x": "z",
				"y": "x",
				"z": "y",
			} as const)[this.axisOfRotation];
		},
		radius(): number|null {
			return this.imageWidth ? (this.imageWidth - 1) * 180 / this.arc / Math.PI * this.hRes : null;
		},
		arcLength(): number|null {
			return this.imageWidth ? (this.imageWidth - 1) * this.hRes : null;
		},
		width(): number|null {
			if (!this.imageWidth || this.radius === null) {
				return null;
			}

			return this.arc <= 180 ? 2 * this.radius * Math.sin(this.arc / 2 / 180 * Math.PI) : this.radius * 2;
		},
		depth(): number|null {
			if (!this.imageWidth || this.radius === null) {
				return null;
			}

			return this.radius * (1 - Math.cos(this.arc / 2 / 180 * Math.PI));
		},
		height(): number|null {
			return this.imageHeight ? (this.imageHeight - 1) * this.vRes : null;
		},
	},
	"methods": {
		recalculate(): void {
			const expr = {
				"x": "",
				"y": "",
				"z": "",
			};
			const arcExpr = `pi*(x/(w-1)*${this.arc} + ${(180-this.arc)/2})/180`;
			const multiplier = `(w-1)*180/${this.arc}/pi/${1 / this.hRes}`;
			if (this.arc < 180) {
				// Move arc to second axis
				expr[this.firstAxis] = `(sin(${arcExpr}) - sin(pi*${(180-this.arc)/2}/180))*${multiplier}`;
			} else {
				expr[this.firstAxis] = `sin(${arcExpr})*${multiplier}`;
			}
			expr[this.secondAxis] = `-cos(${arcExpr})*${multiplier}`;
			expr[this.axisOfRotation] = `(h-y-1)/${1 / this.vRes}`;
			this.$emit("update:xExpression", expr.x);
			this.$emit("update:yExpression", expr.y);
			this.$emit("update:zExpression", expr.z);
		},
		round,
	},
	"emits": [
		"update:xExpression",
		"update:yExpression",
		"update:zExpression",
		"updatePreview",
	],
});
</script>
