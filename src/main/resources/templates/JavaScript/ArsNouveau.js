/**
 * Creates a recipe for the Ars Nouveau Enchanting Apparatus.
 *
 * Allows you to configure the recipe result, pedestal ingredients,
 * main reagent, Source cost, and whether the reagent's NBT data
 * should be preserved.
 *
 * @param {Object} e The KubeJS recipe event.
 * @param {Object} output The resulting item.
 *                          Use the helper function `itemOutput()` or `itemOutputStack()`.
 * @param {Array<Object>} input An array of ingredients used on the pedestals.
 *                          Use helper functions such as `itemInput()` or `itemInputTag()`.
 *                          All items must be wrapped inside an array [].
 * @param {Object|Array<Object>} reagent The main reagent required by the recipe.
 *                          Use helper functions such as `itemInput()` or `itemInputTag()`.
 * @param {number} sourceCost The amount of Source consumed by the recipe.
 * @param {boolean} KeepNBT Whether the reagent's NBT data should be preserved.
 *
 * @example
 * enchanting_apparatus(
 *     e,
 *     itemOutput('createmechanisms:source_mechanism'),
 *     [
 *         itemInputTag('minecraft:logs'),
 *         itemInputTag('minecraft:logs')
 *     ],
 *     itemInputTag('c:gems/amethyst'),
 *     100,
 *     false
 * );
 */
function enchanting_apparatus(e, output, input, reagent, sourceCost, KeepNBT) {
    e.custom({
        type: "ars_nouveau:enchanting_apparatus",
        keepNbtOfReagent: KeepNBT,
        result: output,
        pedestalItems: input,
        reagent: reagent,
        sourceCost: sourceCost
    });
}

/**
 * Creates a recipe for the Ars Nouveau Imbuement Chamber.
 *
 * Defines the main input ingredient, additional pedestal ingredients,
 * resulting item, and Source cost.
 *
 * The pedestal ingredient array can be empty if the recipe does not
 * require any additional pedestal ingredients.
 *
 * @param {Object} e The KubeJS recipe event.
 * @param {Object} output The item produced by the recipe.
 *                          Use the helper function `itemOutput()` or `itemOutputStack()`.
 * @param {Object} input The main input ingredient.
 *                          Use helper functions such as `itemInput()` or `itemInputTag()`.
 * @param {Array<Object>} pedestalItems An array of additional pedestal ingredients.
 *                          Use helper functions such as `itemInput()` or `itemInputTag()`.
 *                          All items must be wrapped inside an array [].
 * @param {number} sourceCost The amount of Source consumed by the recipe.
 *
 * @example
 * // Recipe without additional pedestal ingredients.
 * imbuement(
 *     e,
 *     itemOutput('createmechanisms:source_mechanism'),
 *     itemInputTag('minecraft:logs'),
 *     [],
 *     2000
 * );
 *
 * @example
 * // Recipe with an additional pedestal ingredient.
 * imbuement(
 *     e,
 *     itemOutput('createmechanisms:source_mechanism'),
 *     itemInputTag('minecraft:logs'),
 *     [
 *         itemInputTag('c:gems/amethyst')
 *     ],
 *     20
 * );
 */
function imbuement(e, output, input, pedestalItems, sourceCost) {
    e.custom({
        type: "ars_nouveau:imbuement",
        count: 1,
        input: input,
        output: output,
        pedestalItems: pedestalItems,
        source: sourceCost
    });
}

/**
 * Creates a budding block conversion recipe for Ars Nouveau.
 *
 * Defines the input block and the resulting budding block.
 * The specified input and result must be compatible with the
 * Ars Nouveau budding conversion recipe type.
 *
 * @param {Object} e The KubeJS recipe event.
 * @param {string|Object} output The resulting block or recipe result.
 * @param {string|Object} input The input block or ingredient.
 *
 * @example
 * budding_conversion(
 *     e,
 *     'ae2:flawless_budding_quartz',
 *     'ae2:quartz_block'
 * );
 */
function budding_conversion(e, output, input) {
    e.custom({
        type: "ars_nouveau:budding_conversion",
        input: input,
        result: output
    });
}

/**
 * Creates a recipe for the Ars Nouveau Scry Ritual.
 *
 * Uses the specified tag for both the ritual's augment and highlight.
 * This allows the ritual to identify and highlight blocks associated
 * with the given tag.
 *
 * @param {Object} e The KubeJS recipe event.
 * @param {string} oreTag The resource location of the tag used by the ritual.
 *
 * @example
 * scry_ritual(e, 'c:ores/aluminum');
 */
function scry_ritual(e, oreTag) {
    e.custom({
        type: "ars_nouveau:scry_ritual",
        augment: oreTag,
        highlight: oreTag
    });
}

/**
 * Creates or replaces an Ars Nouveau glyph recipe.
 *
 * Removes an existing glyph recipe with the same recipe ID,
 * then registers the new recipe using the output item's ID.
 *
 * @param {Object} e The KubeJS recipe event.
 * @param {Object} output The output item representing the glyph.
 *                          Use the helper function `itemOutput()` or `itemOutputStack()`.
 * @param {Array<Object>} input An array of ingredients required to craft the glyph.
 *                          Use helper functions such as `itemInput()` or `itemInputTag()`.
 *                          All items must be wrapped inside an array [].
 * @param {number} expCost The experience cost of the recipe.
 *
 * @example
 * glyph(
 *     e,
 *     itemOutput('ars_nouveau:glyph_underfoot'),
 *     [
 *         itemInput('minecraft:iron_boots'),
 *         itemInput('createmechanisms:source_mechanism')
 *     ],
 *     200
 * );
 */
function glyph(e, output, input, expCost) {
    e.remove({
        id: output.id,
        type: "ars_nouveau:glyph"
    });

    e.custom({
        type: "ars_nouveau:glyph",
        exp: expCost,
        inputs: input,
        output: output
    }).id(output.id);
}

/**
 * Creates or replaces an Ars Nouveau enchantment recipe.
 *
 * Removes an existing enchantment recipe with the specified enchantment ID,
 * then registers a new recipe with the given level, pedestal ingredients,
 * and Source cost.
 *
 * The enchantment argument can be a resource location string or an object
 * containing an `id` property.
 *
 * @param {Object} e The KubeJS recipe event.
 * @param {string|{id: string}} enchantment The enchantment ID or an object containing it.
 * @param {number} level The enchantment level to apply.
 * @param {Array<Object>} input An array of ingredients required on the pedestals.
 *                          Use helper functions such as `itemInput()` or `itemInputTag()`.
 *                          All items must be wrapped inside an array [].
 * @param {number} sourceCost The amount of Source consumed by the recipe.
 *
 * @example
 * ars_enchant(
 *     e,
 *     'minecraft:bane_of_arthropods',
 *     1,
 *     [
 *         itemInput('ars_nouveau:source_gem_block'),
 *         itemInput('minecraft:fermented_spider_eye')
 *     ],
 *     2000
 * );
 */
function ars_enchant(e, enchantment, level, input, sourceCost) {
    const enchantmentId =
        typeof enchantment === "string" ? enchantment : enchantment.id;

    e.remove({
        id: enchantmentId,
        type: "ars_nouveau:enchantment"
    });

    e.custom({
        type: "ars_nouveau:enchantment",
        enchantment: enchantmentId,
        level: level,
        pedestalItems: input,
        sourceCost: sourceCost
    });
}

/**
 * Creates a recipe for the Ars Nouveau Dispel Entity mechanic.
 *
 * Generates a recipe ID from the specified entity ID and associates
 * the recipe with the supplied loot conditions and loot table.
 *
 * The generated recipe ID follows this format:
 * `createmechanisms:dispel_<namespace>_<entity>`.
 *
 * The loot conditions and loot table must use the structure expected
 * by the Ars Nouveau Dispel Entity recipe serializer.
 *
 * @param {Object} e The KubeJS recipe event.
 * @param {string} entity The resource location of the entity affected by the recipe.
 * @param {Array<Object>} loot_conditions An array of conditions required for the loot.
 * @param {string} loot_table The resource location of the loot table used by the recipe.
 *
 * @example
 * dispel_entity(
 *     e,
 *     'minecraft:trader_llama',
 *     [
 *         {
 *             condition: 'minecraft:entity_properties',
 *             entity: 'this'
 *         }
 *     ],
 *     'createmechanisms:dispel_trader_llama'
 * );
 *
 * @remarks
 * Use LootJS to create and configure the loot tables that define the drops.
 */
function dispel_entity(e, entity, loot_conditions, loot_table) {
    const id = `createmechanisms:dispel_${entity.replace(':', '_')}`;

    e.custom({
        type: "ars_nouveau:dispel_entity",
        entity: entity,
        loot_conditions: loot_conditions,
        loot_table: loot_table
    }).id(id);
}

/**
 * Creates an Ars Nouveau crushing recipe.
 *
 * Defines the input ingredient, output results, and whether block placement
 * should be skipped when the recipe is processed.
 *
 * The `place` parameter is assigned to `skip_block_place`.
 * If omitted or set to null, its default value is `false`.
 *
 * @param {Object} e The KubeJS recipe event.
 * @param {Object|Array<Object>} output The crushing result or an array of results.
 *                         Use the helper function `crushingOutput()`.
 * @param {Object} input The input ingredient used by the recipe.
 *                         Use the helper function `itemInput`
 * @param {boolean} [place=false] Whether to skip block placement during processing.
 *
 * @example
 * ars_crushing(
 *     e,
 *     [
 *         crushingOutput('ae2:certus_quartz_crystal', 1, 4, 1),
 *         crushingOutput('ae2:certus_quartz_dust', 0.2, 2, 2)
 *     ],
 *     itemInput('ae2:quartz_cluster')
 * );
 */
function ars_crushing(e, output, input, place) {
    place = place ?? false;

    e.custom({
        type: "ars_nouveau:crush",
        input: input,
        output: output,
        skip_block_place: place
    });
}

/**
 * Creates a constant color object in the format used by Ars Nouveau.
 *
 * This helper only returns a color object; it does not register a recipe.
 *
 * The RGB components are passed directly to the returned object.
 * Use values appropriate for the color format expected by Ars Nouveau.
 *
 * @param {number} r The red component.
 * @param {number} g The green component.
 * @param {number} b The blue component.
 * @returns {{id: string, r: number, g: number, b: number}} The constant color object.
 *
 * @example
 * const color = rgb(255, 40, 20);
 */
function rgb(r, g, b) {
    return {
        id: "ars_nouveau:constant",
        r: r,
        g: g,
        b: b
    };
}

/**
 * Validates a list of glyph item IDs.
 *
 * Uses `Item.of()` to check whether each supplied identifier resolves
 * to a valid item. If any item is empty, the function logs an error
 * and throws an exception listing the invalid identifiers.
 *
 * @param {string[]} glyphs An array of glyph item IDs to validate.
 * @returns {boolean} Returns `true` if all glyphs are valid.
 * @throws {Error} Throws an error if one or more glyphs are invalid.
 *
 * @example
 * validateGlyphs([
 *     'ars_nouveau:glyph_projectile',
 *     'ars_nouveau:glyph_crush'
 * ]);
 */
function validateGlyphs(glyphs) {
    const invalidGlyphs = [];

    for (const glyph of glyphs) {
        const item = Item.of(glyph);

        if (item.isEmpty()) {
            invalidGlyphs.push(glyph);
        }
    }

    if (invalidGlyphs.length > 0) {
        const errorMessage =
            `[MustJS] Invalid glyph(s): ${invalidGlyphs.join(", ")}`;

        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    return true;
}

/**
 * Creates a custom Ars Nouveau Caster Tome recipe.
 *
 * Validates the supplied spell glyphs before registering the recipe.
 * Allows you to configure the tome's name, flavor text, spell,
 * sound family, color, pitch, and volume.
 *
 * The recipe ID follows this format:
 * `createmechanisms:tomes/<id>`.
 *
 * @param {Object} e The KubeJS recipe event.
 * @param {string} name The display name of the tome.
 * @param {string} id The identifier used in the recipe ID.
 * @param {string} flavourText The descriptive flavor text displayed for the tome.
 * @param {string[]} spell An array of glyph item IDs that define the spell.
 * @param {string} soundFamily The resource location of the sound family.
 * @param {Object} color The tome's color object, preferably created with `rgb()`.
 * @param {number} pitch The pitch of the tome's sound.
 * @param {number} volume The volume of the tome's sound.
 *
 * @example
 * casterTome(
 *     e,
 *     'Danger Vault',
 *     'danger_vault',
 *     'Vault without all those safety precautions.',
 *     [
 *         'ars_nouveau:glyph_projectile',
 *         'ars_nouveau:glyph_crush'
 *     ],
 *     'ars_nouveau:fire_family',
 *     rgb(255, 0, 0),
 *     1,
 *     1
 * );
 */
function casterTome(e, name, id, flavourText, spell, soundFamily, color, pitch, volume) {
    // Validate the spell glyphs before registering the recipe.
    validateGlyphs(spell);

    e.custom({
        type: "ars_nouveau:caster_tome",
        color: color,
        flavour_text: flavourText,
        name: name,
        sound: {
            family: soundFamily,
            pitch: pitch,
            volume: volume
        },
        spell: spell,
        tome_type: "ars_nouveau:caster_tome"
    }).id(`createmechanisms:tomes/${id}`);
}