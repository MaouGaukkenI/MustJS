var MUSTJS_RECIPE_IDS_Loot = new Set();

const MUSTJS_RESOURCE_LOCATION_CLASS_Loot =
    Java.loadClass("net.minecraft.resources.ResourceLocation");

const MUSTJS_BUILT_IN_REGISTRIES_CLASS_Loot =
    Java.loadClass("net.minecraft.core.registries.BuiltInRegistries");

const MUSTJS_REGISTRIES_CLASS_Loot =
    Java.loadClass("net.minecraft.core.registries.Registries");


const MUSTJS_LOOT_TABLE_CLASS_Loot =
    Java.loadClass("net.minecraft.world.level.storage.loot.LootTable");

const MUSTJS_SERVER_LIFECYCLE_HOOKS_CLASS_Loot =
    Java.loadClass("net.neoforged.neoforge.server.ServerLifecycleHooks");

var MUSTJS_DEFERRED_RESOURCE_VALIDATIONS_Loot = new Set();

/**
 * Queues a resource ID for existence validation after the current datapack reload.
 *
 * @param {string} type Either `enchantment` or `loot_table`.
 * @param {string} resourceId Namespaced resource ID to check.
 * @returns {void} This helper returns no value.
 */
function mustjsQueueDeferredResourceValidation_Loot(type, resourceId) {
    MUSTJS_DEFERRED_RESOURCE_VALIDATIONS_Loot.add(type + "|" + resourceId);
}

/**
 * Drains the deferred-reference queue after datapack loading. This runs each
 * server tick but returns immediately when the queue is empty; missing IDs
 * are reported once to the server log without requiring another `/reload`.
 *
 * The queue is populated by the enchantment and loot-table validators below.
 */
ServerEvents.tick(event => {
    if (MUSTJS_DEFERRED_RESOURCE_VALIDATIONS_Loot.size === 0) {
        return;
    }

    var server =
        MUSTJS_SERVER_LIFECYCLE_HOOKS_CLASS_Loot.getCurrentServer();

    if (server == null) {
        return;
    }

    var pending = Array.from(MUSTJS_DEFERRED_RESOURCE_VALIDATIONS_Loot);
    MUSTJS_DEFERRED_RESOURCE_VALIDATIONS_Loot.clear();

    for (const entry of pending) {
        var separator = entry.indexOf("|");
        var type = entry.substring(0, separator);
        var resourceId = entry.substring(separator + 1);
        var exists = false;

        try {
            var resourceLocation =
                MUSTJS_RESOURCE_LOCATION_CLASS_Loot.parse(resourceId);

            if (type === "enchantment") {
                exists = server.registryAccess().registryOrThrow(
                    MUSTJS_REGISTRIES_CLASS_Loot.ENCHANTMENT
                ).containsKey(resourceLocation);
            } else if (type === "loot_table") {
                exists = server.reloadableRegistries().getLootTable(
                    resourceLocation
                ) !== MUSTJS_LOOT_TABLE_CLASS_Loot.EMPTY;
            }
        } catch (error) {
            console.error(
                `[MustJS] Failed to validate ${type} '${resourceId}' after datapack loading: ${error}`
            );
            continue;
        }

        if (!exists) {
            console.error(
                `[MustJS] Unknown ${type} '${resourceId}' after datapack loading.`
            );
        }
    }
});

/**
 * Generates a diagnostic recipe ID using the same base format as the final
 * recipe ID, checking existing recipe IDs without reserving a new ID.
 *
 * Diagnostic ID format:
 *   mustjs:<recipeType>/<outputItemId>
 *
 * If the output ID is unavailable, "unknown" is used.
 *
 * If the base ID already exists, a numeric suffix is appended.
 *
 * @param {string} recipeType - The recipe type being processed.
 * @param {Object|null|undefined} output - The recipe output object.
 * @returns {string} A diagnostic recipe ID.
 *
 * @remarks
 * - Supports outputs using either output.id or output.stack.id.
 * - Uses the output ID without validating whether the item exists.
 * - Checks MUSTJS_RECIPE_IDS_Loot to avoid matching an already registered ID.
 * - Does not register or reserve the generated diagnostic ID.
 */
function mustjsDiagnosticRecipeIdLoot(recipeType, output) {
    var outputId = "unknown";

    if (
        output &&
        typeof output === "object" &&
        !Array.isArray(output)
    ) {
        var candidateOutputId =
            output.stack !== undefined &&
            output.stack !== null
                ? output.stack.id
                : output.id;

        if (
            typeof candidateOutputId === "string" &&
            candidateOutputId.trim() !== ""
        ) {
            outputId = candidateOutputId.replace(":", "_");
        }
    }

    var recipeBase = `mustjs:${recipeType}/${outputId}`;
    var recipeId = recipeBase;
    var recipeSuffix = 1;

    while (MUSTJS_RECIPE_IDS_Loot.has(recipeId)) {
        recipeId = `${recipeBase}_${recipeSuffix}`;
        recipeSuffix++;
    }

    return recipeId;
}

/**
 * Generates a unique recipe identifier (ID) based on a base ID.
 *
 * @param {string} recipeBase - The base identifier used to generate the recipe ID.
 *                              If this ID has already been registered, a numeric suffix
 *                              will be appended to create a unique identifier.
 *
 * @returns {string} A unique recipe identifier that has been registered in
 *                   MUSTJS_RECIPE_IDS_Loot.
 *
 * @remarks
 * - The MUSTJS_RECIPE_IDS_Loot Set stores the identifiers generated by this function.
 * - If the base ID is already registered, the function appends a numeric suffix,
 *   starting at _1, and increments it until an unused ID is found.
 * - The generated ID is automatically added to MUSTJS_RECIPE_IDS_Loot.
 * - This function only checks IDs stored in MUSTJS_RECIPE_IDS_Loot; it does not
 *   automatically detect IDs registered by other functions or mods.
 *
 * @example
 * mustjsUniqueRecipeIdLoot("mustjs:compacting/minecraft_iron_ingot");
 * // Returns: "mustjs:compacting/minecraft_iron_ingot"
 *
 * mustjsUniqueRecipeIdLoot("mustjs:compacting/minecraft_iron_ingot");
 * // Returns: "mustjs:compacting/minecraft_iron_ingot_1"
 *
 * mustjsUniqueRecipeIdLoot("mustjs:compacting/minecraft_iron_ingot");
 * // Returns: "mustjs:compacting/minecraft_iron_ingot_2"
 */
function mustjsUniqueRecipeIdLoot(recipeBase) {
    var recipeId = recipeBase;
    var recipeSuffix = 1;

    while (MUSTJS_RECIPE_IDS_Loot.has(recipeId)) {
        recipeId = recipeBase + "_" + recipeSuffix;
        recipeSuffix++;
    }

    MUSTJS_RECIPE_IDS_Loot.add(recipeId);

    return recipeId;
}

/**
 * Checks whether an ID exists in a Minecraft registry.
 *
 * @param {string} id - The resource location to validate.
 * @param {string} registryType - The registry type: "item", "fluid", "sound", or "entity".
 * @returns {boolean} True if the ID exists; otherwise, false.
 *
 * @remarks
 * - Returns false when the ID is malformed or the registry type is unsupported.
 * - Logs an error if registry validation throws an exception.
 */
function registryExistsLoot(id, registryType) {
    if (
        typeof id !== "string" ||
        id.trim() === ""
    ) {
        return false;
    }

    try {
        var resourceLocation =
            MUSTJS_RESOURCE_LOCATION_CLASS_Loot.parse(id);

        switch (registryType) {
            case "item":
                return MUSTJS_BUILT_IN_REGISTRIES_CLASS_Loot.ITEM
                    .containsKey(resourceLocation);

            case "fluid":
                return MUSTJS_BUILT_IN_REGISTRIES_CLASS_Loot.FLUID
                    .containsKey(resourceLocation);

            case "sound":
                return MUSTJS_BUILT_IN_REGISTRIES_CLASS_Loot.SOUND_EVENT
                    .containsKey(resourceLocation);

            case "entity":
                return MUSTJS_BUILT_IN_REGISTRIES_CLASS_Loot.ENTITY_TYPE
                    .containsKey(resourceLocation);

            default:
                return false;
        }
    } catch (error) {
        console.error(
            `[MustJS] Failed to validate registry ID '${id}' ` +
            `for registry '${registryType}': ${error}`
        );

        return false;
    }
}

/**
 * Checks whether an item tag exists in the Minecraft tag registry.
 *
 * @param {string} tagId - The resource location of the item tag.
 * @returns {boolean} True if the tag exists; otherwise, false.
 */
function itemTagExistsLoot(tagId) {
    if (
        typeof tagId !== "string" ||
        !tagId.includes(":")
    ) {
        return false;
    }

    try {
        var resourceLocation =
            MUSTJS_RESOURCE_LOCATION_CLASS_Loot.parse(tagId);

        var itemTagKey = Java.loadClass(
            "net.minecraft.tags.TagKey"
        ).create(
            MUSTJS_REGISTRIES_CLASS_Loot.ITEM,
            resourceLocation
        );

        var itemRegistry =
            MUSTJS_BUILT_IN_REGISTRIES_CLASS_Loot.ITEM;

        return itemRegistry.getTag(itemTagKey).isPresent();
    } catch (error) {
        console.error(
            `[MustJS] Failed to validate item tag '${tagId}': ${error}`
        );

        return false;
    }
}

/**
 * Validates an item, item tag, or fluid input.
 *
 * @param {Object} input - An input object created by a MustJS helper.
 * @returns {boolean} True if the input is valid; otherwise, false.
 *
 * @remarks
 * - Exactly one input type must be provided.
 * - Item IDs and fluid IDs are validated against their respective registries.
 * - Item tags are validated against the item tag registry.
 */
function validateInputLoot(input) {
    if (
        typeof input !== "object" ||
        input === null ||
        Array.isArray(input)
    ) {
        return false;
    }

    var hasItem = typeof input.item === "string";
    var hasTag = typeof input.tag === "string";
    var hasFluid = typeof input.fluid === "string";

    // Exactly one input type must be supplied.
    var inputTypeCount =
        (hasItem ? 1 : 0) +
        (hasTag ? 1 : 0) +
        (hasFluid ? 1 : 0);

    if (inputTypeCount !== 1) {
        return false;
    }

    if (hasItem) {
        return registryExistsLoot(input.item, "item");
    }

    if (hasTag) {
        return itemTagExistsLoot(input.tag);
    }

    if (hasFluid) {
        return registryExistsLoot(input.fluid, "fluid");
    }

    return false;
}

/**
 * Validates an item or fluid output.
 *
 * Supports itemOutput(), itemOutputStack(), itemOutputChance(),
 * itemOutputChanceStack(), and fluidOutput().
 *
 * @param {Object} output - An item or fluid output object.
 * @returns {boolean} True if the output is valid; otherwise, false.
 *
 * @remarks
 * - Item outputs may use output.id or output.stack.id.
 * - Fluid outputs use output.id and output.amount.
 * - Fluid outputs cannot specify item count or chance.
 * - Item counts must be positive safe integers when provided.
 * - Chances must be finite numbers between 0 and 1, inclusive.
 */
function validateOutputLoot(output) {
    if (
        typeof output !== "object" ||
        output === null ||
        Array.isArray(output)
    ) {
        return false;
    }

    var hasStack =
        output.stack !== undefined &&
        output.stack !== null;

    var hasCount = hasStack
        ? output.stack.count !== undefined
        : output.count !== undefined;

    var hasChance = output.chance !== undefined;
    var hasAmount = output.amount !== undefined;

    /*
     * Validate fluid outputs separately.
     * Do not check the item registry before this branch.
     */
    if (hasAmount) {
        if (hasCount || hasChance || hasStack) {
            return false;
        }

        return (
            typeof output.id === "string" &&
            output.id.trim() !== "" &&
            registryExistsLoot(output.id, "fluid") &&
            typeof output.amount === "number" &&
            Number.isFinite(output.amount) &&
            output.amount > 0
        );
    }

    /*
     * Resolve the item ID without assuming that output.stack exists.
     */
    var outputId = hasStack
        ? output.stack.id
        : output.id;

    if (
        typeof outputId !== "string" ||
        outputId.trim() === "" ||
        !registryExistsLoot(outputId, "item")
    ) {
        return false;
    }

    var count = hasStack
        ? output.stack.count
        : output.count;

    if (
        hasCount &&
        (
            typeof count !== "number" ||
            !Number.isSafeInteger(count) ||
            count <= 0
        )
    ) {
        return false;
    }

    return !(hasChance &&
        (
            typeof output.chance !== "number" ||
            !Number.isFinite(output.chance) ||
            output.chance < 0 ||
            output.chance > 1
        ));
}

/**
 * Checks whether a sound event exists in the Minecraft sound event registry.
 *
 * @param {string} soundId - The resource location of the sound event.
 * @returns {boolean} True if the sound event exists; otherwise, false.
 *
 * @remarks
 * - Uses registryExistsLoot() to validate the sound event.
 * - Does not validate the associated sound files.
 */
function soundEventExistsLoot(soundId) {
    return registryExistsLoot(soundId, "sound");
}

/**
 * Validates the enchantment ID syntax and queues an existence check
 * for after the datapack reload completes.
 *
 * @param {string} enchantmentId - The enchantment resource location.
 * @returns {boolean} True when the ID has valid resource location syntax.
 */
function validateEnchantmentLoot(enchantmentId) {
    if (
        typeof enchantmentId !== "string" ||
        enchantmentId.trim() === ""
    ) {
        return false;
    }

    try {
        MUSTJS_RESOURCE_LOCATION_CLASS_Loot.parse(enchantmentId);
        mustjsQueueDeferredResourceValidation_Loot("enchantment", enchantmentId);
        return true;
    } catch (error) {
        console.error(
            `[MustJS] Failed to validate enchantment ID '${enchantmentId}': ${error}`
        );

        return false;
    }
}

/**
 * Validates the loot table ID syntax and queues an existence check
 * for after the datapack reload completes.
 *
 * @param {string} lootTableId - The loot table resource location.
 * @returns {boolean} True when the ID has valid resource location syntax.
 */
function validateLootTableLoot(lootTableId) {
    if (
        typeof lootTableId !== "string" ||
        lootTableId.trim() === ""
    ) {
        return false;
    }

    try {
        MUSTJS_RESOURCE_LOCATION_CLASS_Loot.parse(lootTableId);
        mustjsQueueDeferredResourceValidation_Loot("loot_table", lootTableId);
        return true;
    } catch (error) {
        console.error(
            `[MustJS] Failed to validate loot_table ID '${lootTableId}': ${error}`
        );

        return false;
    }
}

/**
 * Checks whether an entity type ID exists.
 *
 * @param {string} entityId - The entity type resource location.
 * @returns {boolean} True if the entity type exists.
 */
function entityExistsLoot(entityId) {
    return registryExistsLoot(entityId, "entity");
}

/**
 * Gets a readable identifier for a recipe ingredient or output.
 *
 * @param {Object|null|undefined} object - The ingredient or output object.
 * @returns {string} The item, tag, fluid, or an indication of invalid data.
 */
function mustjsGetObjectIdLoot(object) {
    if (object === null || object === undefined) {
        return "undefined";
    }

    if (typeof object !== "object") {
        return String(object);
    }

    if (typeof object.item === "string") {
        return object.item;
    }

    if (typeof object.tag === "string") {
        return `#${object.tag}`;
    }

    if (typeof object.fluid === "string") {
        return object.fluid;
    }

    if (typeof object.id === "string") {
        return object.id;
    }

    if (object.stack && typeof object.stack.id === "string") {
        return object.stack.id;
    }

    return "unknown";
}
// === Recipe generation helper functions ===
/**
 * Creates a loot table and populates it with one or more pools.
 *
 * @param {Object} e LootJS.lootTables event passed into `LootJS.lootTables(e => ...)`.
 * @param {string} name Table ID. Names without a namespace are stored under `mustjs:lootjs/`.
 * @param {Array<Array<Object>>} pools Each inner array becomes one pool. Entries are made with `lootPoolOutput()`.
 * @returns {Object|null} Native LootTable builder, or null after a validation error.
 *
 * @example
 * LootJS.lootTables(e => {
 *     lootAddLootTable(
 *         e,
 *         "dispel_trader_llama",
 *         [
 *             [
 *                 lootPoolOutput(itemOutput("minecraft:blaze_rod"), 1, 20),
 *                 lootPoolOutput(itemOutput("minecraft:diamond"), [2, 6], 40)
 *             ],
 *             [
 *                 lootPoolOutput(itemOutput("createmechanisms:source_mechanism"))
 *             ]
 *         ]
 *     );
 * });
 */
function lootAddLootTable(e, name, pools) {
    const recipeType = "add_loot_table";

    let error = false;

    // Validate Loot Table Name
    if (
        typeof name !== "string" ||
        name.length === 0 ||
        !/^(?:[a-z0-9_.-]+:)?[a-z0-9/._-]+$/.test(name)
    ) {
        const diagnosticId = mustjsDiagnosticRecipeIdLoot(
            recipeType,
            { id: "mustjs:lootjs/unknown" }
        );

        console.error(
            `[MustJS] [${diagnosticId}] Add Loot Table: Invalid name.\n` +
            `Name: ${name}\n` +
            "Expected a valid loot table name or resource location."
        );

        return null;
    }

    // Normalize Loot Table Name
    if (name.indexOf(":") === -1) {
        name = `mustjs:lootjs/${name}`;
    }

    const diagnosticId = mustjsDiagnosticRecipeIdLoot(
        recipeType,
        { id: name }
    );

    // Validate Pools
    if (!Array.isArray(pools) || pools.length === 0) {
        console.error(
            `[MustJS] [${diagnosticId}] Add Loot Table: Invalid pools.\n` +
            "Expected a non-empty array of loot pools."
        );

        return null;
    }

    // Validate Pool Definitions
    for (var i = 0; i < pools.length; i++) {
        var pool = pools[i];

        if (!Array.isArray(pool) || pool.length === 0) {
            console.error(
                `[MustJS] [${diagnosticId}] Add Loot Table: Invalid pool at index ${i}.\n` +
                "Expected a non-empty array of loot entries."
            );

            error = true;
            continue;
        }

        for (var j = 0; j < pool.length; j++) {
            var entry = pool[j];

            if (
                !entry ||
                typeof entry !== "object" ||
                !validateOutputLoot(entry.output)
            ) {
                console.error(
                    `[MustJS] [${diagnosticId}] Pool Output: Invalid output.\n` +
                    `Pool: ${i}, Entry: ${j}\n` +
                    "Expected a valid item output created with an item output helper."
                );

                error = true;
                continue;
            }

            // Validate Weight
            if (
                entry.weight != null &&
                (
                    typeof entry.weight !== "number" ||
                    !Number.isFinite(entry.weight) ||
                    !Number.isSafeInteger(entry.weight) ||
                    entry.weight <= 0
                )
            ) {
                console.error(
                    `[MustJS] [${diagnosticId}] Pool Output: Invalid weight.\n` +
                    `Output: ${entry.output.id}\n` +
                    "Expected a positive, finite integer weight."
                );

                error = true;
            }

            // Validate Stack
            if (entry.stack != null) {
                var stack = entry.stack;

                if (typeof stack === "number") {
                    if (
                        !Number.isSafeInteger(stack) ||
                        stack <= 0
                    ) {
                        console.error(
                            `[MustJS] [${diagnosticId}] Pool Output: Invalid stack.\n` +
                            `Output: ${entry.output.id}\n` +
                            "Expected a positive integer stack."
                        );

                        error = true;
                    }
                } else if (Array.isArray(stack)) {
                    if (
                        stack.length !== 2 ||
                        !Number.isSafeInteger(stack[0]) ||
                        !Number.isSafeInteger(stack[1]) ||
                        stack[0] <= 0 ||
                        stack[1] < stack[0]
                    ) {
                        console.error(
                            `[MustJS] [${diagnosticId}] Pool Output: Invalid stack range.\n` +
                            `Output: ${entry.output.id}\n` +
                            "Expected [min, max] with positive integers and min <= max."
                        );

                        error = true;
                    }
                } else {
                    console.error(
                        `[MustJS] [${diagnosticId}] Pool Output: Invalid stack.\n` +
                        `Output: ${entry.output.id}\n` +
                        "Expected a positive integer or an array [min, max]."
                    );

                    error = true;
                }
            }
        }
    }

    // Stop if validation failed
    if (error) {
        return null;
    }

    // Create Loot Table
    const lootTable = e.create(name);

    for (var i = 0; i < pools.length; i++) {
        var pool = pools[i];

        lootTable.createPool(poolBuilder => {
            for (var j = 0; j < pool.length; j++) {
                var data = pool[j];

                var lootEntry = LootEntry.of(data.output.id);

                if (data.weight != null) {
                    lootEntry = lootEntry.withWeight(data.weight);
                }

                if (data.stack != null) {
                    lootEntry = lootEntry.setCount(data.stack);
                }

                poolBuilder.addEntry(lootEntry);
            }
        });
    }

    return lootTable;
}

// === LootJS table event adapters ===
/**
 * Returns the available loot table IDs, optionally filtered by an ID string or regular expression.
 *
 * @param {Object} e LootJS.lootTables event.
 * @param {string|RegExp} filter Optional loot table ID filter.
 * @returns {string[]} Matching IDs, or an empty array when the event is invalid.
 * @example var ids = lootTableIds(e, /chests/);
 */
function lootTableIds(e, filter) {
    if (!e || typeof e.getLootTableIds !== "function") return [];
    return filter === undefined ? e.getLootTableIds() : e.getLootTableIds(filter);
}

/**
 * Checks whether the current LootJS event contains a table ID.
 *
 * @param {Object} e LootJS.lootTables event.
 * @param {string} id Namespaced loot table ID.
 * @returns {boolean} True when the table exists; otherwise false.
 */
function lootHasTable(e, id) {
    return !!e && typeof e.hasLootTable === "function" && e.hasLootTable(id);
}

/**
 * Gets a mutable LootJS table builder by ID.
 *
 * @param {Object} e LootJS.lootTables event.
 * @param {string} id Namespaced loot table ID.
 * @returns {Object|null} Table builder, or null when the event or table is unavailable.
 */
function lootGetTable(e, id) {
    return e && typeof e.getLootTable === "function" ? e.getLootTable(id) : null;
}

/**
 * Creates a table and optionally runs a callback with its builder.
 *
 * @param {Object} e LootJS.lootTables event.
 * @param {string} id New namespaced ID, such as `example:rare_drops`.
 * @param {Object} type Optional LootType; LootJS default applies when omitted.
 * @param {Function} configure Optional callback receiving the created table.
 * @returns {Object|null} Created table builder.
 * @example lootCreateTable(e, "example:rare_drops", LootType.ENTITY, table => lootCreatePool(table));
 */
function lootCreateTable(e, id, type, configure) {
    if (!e || typeof e.create !== "function") return null;
    var table = type === undefined ? e.create(id) : e.create(id, type);
    if (typeof configure === "function") configure(table);
    return table;
}

/**
 * Clears all tables matching an ID filter.
 *
 * @param {Object} e LootJS.lootTables event.
 * @param {string|RegExp} filter ID string or regular expression.
 * @returns {*} Native LootJS result, or null when unsupported.
 */
function lootClearTables(e, filter) {
    return e && typeof e.clearLootTables === "function" ? e.clearLootTables(filter) : null;
}

/**
 * Selects one or more tables by ID filters and optionally configures the resulting collection.
 *
 * @param {Object} e LootJS.lootTables event.
 * @param {string|RegExp|Array} filters One filter or an array of filters.
 * @param {Function} configure Optional callback receiving the table collection.
 * @returns {Object|null} Native LootJS table collection.
 */
function lootModifyTables(e, filters, configure) {
    if (!e || typeof e.modifyLootTables !== "function") return null;
    var list = Array.isArray(filters) ? filters : [filters];
    var tables = e.modifyLootTables.apply(e, list);
    if (typeof configure === "function") configure(tables);
    return tables;
}

/**
 * Selects tables by one or more LootType values.
 *
 * @param {Object} e LootJS.lootTables event.
 * @param {Object|Array} types One LootType or an array of types.
 * @param {Function} configure Optional callback receiving the table collection.
 * @returns {Object|null} Native LootJS table collection.
 */
function lootModifyTypeTables(e, types, configure) {
    if (!e || typeof e.modifyLootTypeTables !== "function") return null;
    var list = Array.isArray(types) ? types : [types];
    var tables = e.modifyLootTypeTables.apply(e, list);
    if (typeof configure === "function") configure(tables);
    return tables;
}

/**
 * Gets the loot table attached to one block.
 *
 * @param {Object} e LootJS.lootTables event.
 * @param {string} block Namespaced block ID.
 * @returns {Object|null} Table builder, or null when no matching table exists.
 */
function lootGetBlockTable(e, block) {
    return e && typeof e.getBlockTable === "function" ? e.getBlockTable(block) : null;
}

/**
 * Selects loot tables attached to one or more blocks.
 *
 * @param {Object} e LootJS.lootTables event.
 * @param {string|Array} blocks Block ID or a list accepted by the installed LootJS version.
 * @param {Function} configure Optional callback receiving the table collection.
 * @returns {Object|null} Native LootJS table collection.
 */
function lootModifyBlockTables(e, blocks, configure) {
    if (!e || typeof e.modifyBlockTables !== "function") return null;
    var list = Array.isArray(blocks) ? blocks : [blocks];
    var tables = e.modifyBlockTables.apply(e, list);
    if (typeof configure === "function") configure(tables);
    return tables;
}

/**
 * Gets the loot table attached to one entity type.
 *
 * @param {Object} e LootJS.lootTables event.
 * @param {string} entity Namespaced entity type ID.
 * @returns {Object|null} Table builder, or null when no matching table exists.
 */
function lootGetEntityTable(e, entity) {
    return e && typeof e.getEntityTable === "function" ? e.getEntityTable(entity) : null;
}

/**
 * Selects loot tables attached to one or more entity types.
 *
 * @param {Object} e LootJS.lootTables event.
 * @param {string|Array} entities Entity ID or a list accepted by the installed LootJS version.
 * @param {Function} configure Optional callback receiving the table collection.
 * @returns {Object|null} Native LootJS table collection.
 */
function lootModifyEntityTables(e, entities, configure) {
    if (!e || typeof e.modifyEntityTables !== "function") return null;
    var list = Array.isArray(entities) ? entities : [entities];
    var tables = e.modifyEntityTables.apply(e, list);
    if (typeof configure === "function") configure(tables);
    return tables;
}

// === LootJS modifier event adapters ===
/**
 * Returns the global loot modifiers registered by mods.
 *
 * @param {Object} e LootJS.modifiers event.
 * @returns {Object|null} Native modifier list, or null when unsupported.
 */
function lootGlobalModifiers(e) {
    return e && typeof e.getGlobalModifiers === "function" ? e.getGlobalModifiers() : null;
}

/**
 * Removes global modifiers whose IDs match the filter.
 *
 * @param {Object} e LootJS.modifiers event.
 * @param {string|RegExp} filter Modifier ID string or regular expression.
 * @returns {*} Native LootJS result.
 */
function lootRemoveGlobalModifiers(e, filter) {
    return e && typeof e.removeGlobalModifiers === "function"
        ? e.removeGlobalModifiers(filter)
        : null;
}

/**
 * Creates a modifier for matching loot tables.
 *
 * @param {Object} e LootJS.modifiers event.
 * @param {*} filter Table ID, regex, LootType, or filter list supported by LootJS.
 * @param {Function} configure Optional callback receiving the modifier.
 * @returns {Object|null} LootModifier builder.
 */
function lootAddTableModifier(e, filter, configure) {
    return lootCreateModifier(e, "table", filter, configure);
}

/**
 * Creates a modifier for matching entity drops.
 *
 * @param {Object} e LootJS.modifiers event.
 * @param {*} filter Entity ID, tag, or list supported by LootJS.
 * @param {Function} configure Optional callback receiving the modifier.
 * @returns {Object|null} LootModifier builder.
 */
function lootAddEntityModifier(e, filter, configure) {
    return lootCreateModifier(e, "entity", filter, configure);
}

/**
 * Creates a modifier for matching block drops.
 *
 * @param {Object} e LootJS.modifiers event.
 * @param {*} filter Block ID, tag, regex, or list supported by LootJS.
 * @param {Function} configure Optional callback receiving the modifier.
 * @returns {Object|null} LootModifier builder.
 */
function lootAddBlockModifier(e, filter, configure) {
    return lootCreateModifier(e, "block", filter, configure);
}

/**
 * Shared implementation for creating table, entity, or block modifiers.
 *
 * @param {Object} e LootJS.modifiers event.
 * @param {string} target One of `table`, `entity`, or `block`.
 * @param {*} filter Target filter accepted by LootJS.
 * @param {Function} configure Optional callback receiving the modifier.
 * @returns {Object|null} LootModifier builder; null for invalid targets.
 */
function lootCreateModifier(e, target, filter, configure) {
    if (!e) return null;
    var method = {
        table: "addTableModifier",
        entity: "addEntityModifier",
        block: "addBlockModifier"
    }[target];
    if (!method || typeof e[method] !== "function") return null;
    var modifier = e[method](filter);
    if (typeof configure === "function") configure(modifier);
    return modifier;
}

// Invoke any method supported by a LootJS event, table, pool, entry, or modifier.
/**
 * Calls any native method on an event, table, pool, entry, transformer, or modifier; arguments and return value pass through unchanged.
 *
 * @param {Object} target Native LootJS object.
 * @param {string} method Exact method name.
 * @param {...*} args Arguments passed to the method.
 * @returns {*} Native result, or null with a console error if that method is unavailable.
 * @example lootCall(table, "removeItem", "minecraft:rotten_flesh");
 */
function lootCall(target, method) {
    if (!target || typeof target[method] !== "function") {
        console.error(`[Loot] Unsupported LootJS method: ${method}`);
        return null;
    }
    return target[method].apply(target, Array.prototype.slice.call(arguments, 2));
}

// Common LootModifier methods; use lootCall for any additional native method.
/**
 * Adds one or more entries to a LootModifier.
 *
 * @param {Object} modifier LootModifier builder.
 * @param {*} entries One entry or an array of entries.
 * @returns {Object|null} Native LootModifier result.
 * @remarks A LootEntry condition such as `.when(c => c.randomChance(0.1))` is evaluated by the modifier.
 * LootJS documents count functions on entries as behaving differently in modifier events.
 */
function lootModifierAdd(modifier, entries) {
    var items = Array.isArray(entries) ? entries : [entries];
    return lootCall.apply(null, [modifier, "addLoot"].concat(items));
}

/**
 * Adds alternative entries; the first successful child is used.
 *
 * @param {Object} modifier LootModifier builder.
 * @param {*} entries One entry or an array of alternatives.
 * @returns {Object|null} Native LootModifier result.
 */
function lootModifierAlternatives(modifier, entries) {
    var items = Array.isArray(entries) ? entries : [entries];
    return lootCall.apply(null, [modifier, "addAlternativesLoot"].concat(items));
}

/**
 * Adds entries in sequence until a condition fails.
 *
 * @param {Object} modifier LootModifier builder.
 * @param {*} entries One entry or an array of sequence entries.
 * @returns {Object|null} Native LootModifier result.
 */
function lootModifierSequence(modifier, entries) {
    var items = Array.isArray(entries) ? entries : [entries];
    return lootCall.apply(null, [modifier, "addSequenceLoot"].concat(items));
}

/**
 * Removes matching generated loot.
 *
 * @param {Object} modifier LootModifier builder.
 * @param {*} filter Item ID, tag, LootEntry, or ItemFilter.
 * @returns {Object|null} Native LootModifier result.
 */
function lootModifierRemove(modifier, filter) {
    return lootCall(modifier, "removeLoot", filter);
}

/**
 * Replaces matching generated items and optionally preserves data.
 *
 * @param {Object} modifier LootModifier builder.
 * @param {*} filter Item/filter to match.
 * @param {*} replacement Replacement item or LootEntry.
 * @param {boolean} preserveCount Optional count preservation.
 * @param {string[]} preserveComponents Optional component IDs to preserve.
 * @returns {Object|null} Native LootModifier result.
 */
function lootModifierReplace(modifier, filter, replacement, preserveCount, preserveComponents) {
    var args = ["replaceLoot", filter, replacement];
    if (preserveCount !== undefined) args.push(preserveCount);
    if (preserveComponents !== undefined) args.push(preserveComponents);
    return lootCall.apply(null, [modifier].concat(args));
}

/**
 * Runs a callback on each generated item matching a filter.
 *
 * @param {Object} modifier LootModifier builder.
 * @param {*} filter Item ID, tag, or ItemFilter.
 * @param {Function} callback Receives and must return the modified item stack.
 * @returns {Object|null} Native LootModifier result.
 */
function lootModifierModify(modifier, filter, callback) {
    return lootCall(modifier, "modifyLoot", filter, callback);
}

/**
 * Creates a pool inside a modifier.
 *
 * @param {Object} modifier LootModifier builder.
 * @param {Function} callback Receives the new LootPool builder.
 * @returns {Object|null} Native LootModifier result.
 */
function lootModifierPool(modifier, callback) {
    return lootCall(modifier, "pool", callback);
}

/**
 * Creates a nested modifier group, optionally filtered.
 *
 * @param {Object} modifier LootModifier builder.
 * @param {*} filter Item filter, or callback when no filter is needed.
 * @param {Function} callback Optional callback receiving nested modifier.
 * @returns {Object|null} Native LootModifier result.
 */
function lootModifierGroup(modifier, filter, callback) {
    return typeof filter === "function"
        ? lootCall(modifier, "group", filter)
        : lootCall(modifier, "group", filter, callback);
}

/**
 * Adds custom runtime logic for the LootContext and loot bucket.
 *
 * @param {Object} modifier LootModifier builder.
 * @param {Function} callback Receives context and mutable loot bucket.
 * @returns {Object|null} Native LootModifier result.
 */
function lootModifierCustomAction(modifier, callback) {
    return lootCall(modifier, "customAction", callback);
}

/**
 * Drops experience at the loot position.
 *
 * @param {Object} modifier LootModifier builder.
 * @param {number|Array|Object} amount LootJS number provider value.
 * @returns {Object|null} Native LootModifier result.
 */
function lootModifierExperience(modifier, amount) {
    return lootCall(modifier, "dropExperience", amount);
}

/**
 * Triggers lightning where the loot drops.
 *
 * @param {Object} modifier LootModifier builder.
 * @param {boolean} damagePlayers Whether the lightning strike may hurt players.
 * @returns {Object|null} Native LootModifier result.
 */
function lootModifierLightning(modifier, damagePlayers) {
    return lootCall(modifier, "triggerLightningStrike", Boolean(damagePlayers));
}
