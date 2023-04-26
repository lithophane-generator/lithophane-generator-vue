<template>
	<transition name="slide-transition">
		<div v-if="showIf || hide" v-show="showIf || !hide" ref="el" class="slide-container"><slot/></div>
	</transition>
</template>

<style scoped lang="scss">
	.slide-container {
		display: flex;
		flex-direction: column;
	}
	.slide-transition-enter-active, .slide-transition-leave-active {
		transition: all .3s ease-in-out;
	}
	.slide-transition-enter-from, .slide-transition-leave-to {
		max-height: 0;
		overflow: hidden;
	}
	.slide-transition-enter-to, .slide-transition-leave-from {
		max-height: var(--transition-height);
		overflow: hidden;
	}
</style>

<script lang="ts">
import { assert } from "@/util";
import { defineComponent, nextTick } from "vue";

const component = defineComponent({
	"props": {
		"showIf": { "type": Boolean, "required": true },
		"hide": { "type": Boolean, "default": false }, // Hide instead of removing
	},
	"watch": {
		async showIf(shown: boolean) {
			if (shown) {
				// Wait for height to be calculated
				await nextTick();
			}
			const el = this.$refs.el;
			assert(el instanceof HTMLDivElement);
			el.style.setProperty("--transition-height", `${el.scrollHeight}px`);
		},
	},
});

export default component;
</script>
