/**
 * Creates an item output object with a specified chance, stack count, and maximum range.
 *
 * @param {string} id - The item identifier.
 * @param {number} chance - The probability of obtaining the item (0.0 – 1.0).
 * @param {number} count - The number of items in the stack.
 * @param {number} maxRange - The maximum stack count multiplier.
 * @returns {Object|null} The item output object, or null if the arguments are invalid.
 *
 * @example
 * // 50% chance of obtaining 3 iron ingots, with a maximum range of 1.
 * crushingOutput("minecraft:iron_ingot", 0.5, 3, 1);
 */
function crushingOutput(id, chance, count, maxRange) {
    if (typeof id !== "string" || id.trim() === "") {
        console.error("crushingOutput: Invalid id: must be a non-empty string.");
        return null;
    }

    if (typeof chance !== "number" || !Number.isFinite(chance) || chance < 0 || chance > 1) {
        console.error("crushingOutput: Invalid chance: must be a number between 0 and 1.");
        return null;
    }

    if (typeof count !== "number" || !Number.isInteger(count) || count <= 0) {
        console.error("crushingOutput: Invalid count: must be a positive integer.");
        return null;
    }

    if (typeof maxRange !== "number" || !Number.isFinite(maxRange) || maxRange <= 0) {
        console.error("crushingOutput: Invalid maxRange: must be a positive number.");
        return null;
    }

    return {
        chance: chance,
        stack: {
            id: id,
            count: count
        },
        maxRange: maxRange
    };
}