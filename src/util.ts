export function assert(condition: boolean): asserts condition {
	if (!condition) {
		throw new Error("Assertion failed");
	}
}

export function round(num: number, places: number|undefined): number {
	places = places ?? 0;

	return Math.round((num + Number.EPSILON) * 10**places) / 10**places;
}

export function hasProperty<P extends string>(obj: object, property: P): obj is { [p in P]: unknown } {
	return property in obj;
}
