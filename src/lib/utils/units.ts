// This utility standardizes unit conversions

export const VOLUME_UNITS = ['l', 'ml'];
export const WEIGHT_UNITS = ['kg', 'g'];
export const COUNT_UNITS = ['piece', 'packet', 'dozen'];

/**
 * Checks if two units are of the same measurement type (e.g. both weight, or both volume)
 */
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
    const u1 = unit1.toLowerCase();
    const u2 = unit2.toLowerCase();

    if (u1 === u2) return true;

    if (WEIGHT_UNITS.includes(u1) && WEIGHT_UNITS.includes(u2)) return true;
    if (VOLUME_UNITS.includes(u1) && VOLUME_UNITS.includes(u2)) return true;

    // Count units and custom units are strictly matched
    return false;
}

/**
 * Calculates the total cost of an ingredient given its quantity, dish unit, and the global price per global unit.
 * E.g., Dish uses 500g, Global item is 50/kg -> cost is 25.
 */
export function calculateIngredientCost(
    dishQuantity: number,
    dishUnit: string,
    globalPricePerUnit: number,
    globalUnit: string
): number {
    const dUnit = dishUnit.toLowerCase();
    const gUnit = globalUnit.toLowerCase();

    if (dUnit === gUnit) {
        return dishQuantity * globalPricePerUnit;
    }

    // Weight conversions
    if (dUnit === 'g' && gUnit === 'kg') {
        return (dishQuantity / 1000) * globalPricePerUnit;
    }
    if (dUnit === 'kg' && gUnit === 'g') {
        return (dishQuantity * 1000) * globalPricePerUnit;
    }

    // Volume conversions
    if (dUnit === 'ml' && gUnit === 'l') {
        return (dishQuantity / 1000) * globalPricePerUnit;
    }
    if (dUnit === 'l' && gUnit === 'ml') {
        return (dishQuantity * 1000) * globalPricePerUnit;
    }

    // Fallback if not compatible (though UI should prevent this)
    return dishQuantity * globalPricePerUnit;
}

/**
 * Returns available units for the dish dropdown based on the global unit type.
 */
export function getAvailableUnitsForGlobal(globalUnit: string): string[] {
    const gUnit = globalUnit.toLowerCase();

    if (WEIGHT_UNITS.includes(gUnit)) return WEIGHT_UNITS;
    if (VOLUME_UNITS.includes(gUnit)) return VOLUME_UNITS;

    // For custom units (piece, packet, dozen), only allow exact match to prevent wrong math
    return [gUnit];
}
