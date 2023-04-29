declare module "lithophane_creator_wasm/lithophane_creator_bg.wasm";
declare module "lithophane_creator_wasm/lithophane_creator" {
	/* tslint:disable */
	/* eslint-disable */
	/**
	*/
	export function init(): void;
	/**
	* @param {string} x_expression
	* @param {string} y_expression
	* @param {string} z_expression
	* @param {Uint8Array} image
	* @param {number} white_depth
	* @param {number} black_depth
	* @returns {Uint8Array}
	*/
	export function generate_lithophane(x_expression: string, y_expression: string, z_expression: string, image: Uint8Array, white_depth: number, black_depth: number): Uint8Array;
	/**
	* @param {string} x_expression
	* @param {string} y_expression
	* @param {string} z_expression
	* @param {number} width
	* @param {number} height
	* @param {number} x_scale
	* @param {number} y_scale
	* @returns {Uint8Array}
	*/
	export function generate_preview(x_expression: string, y_expression: string, z_expression: string, width: number, height: number, x_scale: number, y_scale: number): Uint8Array;
	/**
	* @param {Uint8Array} image
	* @returns {ImageDimensions}
	*/
	export function get_image_dimensions(image: Uint8Array): ImageDimensions;
	/**
	*/
	export class ImageDimensions {
	free(): void;
	/**
	*/
	height: number;
	/**
	*/
	width: number;
	}
}
