<template>
	<div class="config-preset-container">
		<div class="config-presets">
			<button type="button" @click="settingsType = 'RectangleSettings'">Rectangle</button>
			<button type="button" @click="settingsType = 'CylinderCurveSettings'">Cylinder Curve</button>
			<button type="button" @click="settingsType = null">Custom</button>
		</div>
		<KeepAlive>
			<VerticalSlideTransition :showIf="settingsType !== null" :hide="true">
				<div class="config-preset-settings">
					<KeepAlive>
						<component
							:is="settingsType"
							:imageWidth="imageWidth"
							:imageHeight="imageHeight"
							@update:xExpression="$emit('update:xExpression', $event)"
							@update:yExpression="$emit('update:yExpression', $event)"
							@update:zExpression="$emit('update:zExpression', $event)"
							@updatePreview="$emit('updatePreview')"
						/>
					</KeepAlive>
				</div>
			</VerticalSlideTransition>
		</KeepAlive>
	</div>

	<label>
		X Expression:
		<input
			:value="xExpression"
			:disabled="settingsType !== null"
			@input="$emit('update:xExpression', $event.target.value)"
			@focusout="$emit('updatePreview')"
		>
	</label>
	<label>
		Y Expression:
		<input
			:value="yExpression"
			:disabled="settingsType !== null"
			@input="$emit('update:yExpression', $event.target.value)"
			@focusout="$emit('updatePreview')"
		>
	</label>
	<label>
		Z Expression:
		<input
			:value="zExpression"
			:disabled="settingsType !== null"
			@input="$emit('update:zExpression', $event.target.value)"
			@focusout="$emit('updatePreview')"
		>
	</label>
</template>

<style scoped lang="scss">
.config-preset-settings {
	background-color: rgba(255, 255, 255, .1);
	padding: 1rem;
	border-radius: 1rem;
	margin-bottom: var(--spacing);

	> ::v-deep(label:last-child) {
		margin-bottom: 0;
	}
}

.config-presets {
	display: flex;
	gap: 1em;
	margin-bottom: 1em;
	button {
		margin: 0;
	}
}
</style>

<script lang="ts">
import { defineComponent, nextTick, PropType } from "vue";
import RectangleSettings from "./settings/RectangleSettings.vue";
import CylinderCurveSettings from "./settings/CylinderCurveSettings.vue";
import VerticalSlideTransition from "./VerticalSlideTransition.vue";

const settingsTypes = {
	RectangleSettings,
	CylinderCurveSettings,
} as const;

export default defineComponent({
	"components": {
		...settingsTypes,
		VerticalSlideTransition,
	},
	"props": {
		"xExpression": { "type": String as PropType<string>, "default": "" },
		"yExpression": { "type": String as PropType<string>, "default": "" },
		"zExpression": { "type": String as PropType<string>, "default": "" },
		"imageWidth": { "type": Number as PropType<number> },
		"imageHeight": { "type": Number as PropType<number> },
	},
	data() {
		return {
			"settingsType": "RectangleSettings" as keyof typeof settingsTypes|null,
		};
	},
	"emits": [
		"update:xExpression",
		"update:yExpression",
		"update:zExpression",
		"updatePreview",
	],
	"watch": {
		async settingsType(): Promise<void> {
			await nextTick();
			this.$emit("updatePreview");
		},
	},
});
</script>
