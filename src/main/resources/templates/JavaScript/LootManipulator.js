/**
 * Creates a loot pool entry configuration.
 *
 * Defines the output item and optionally specifies its stack size and weight.
 * Invalid numeric stack sizes or weights are stored as `null`, so LootJS uses
 * defaults. Array ranges are passed through and validated by `lootAddLootTable`.
 *
 * @param {Object} output - Item output configuration with an `id`, usually made by `itemOutput()`.
 * @param {number|number[]|null} [stack=null] - Positive integer count or `[min, max]` range. Omit/null for LootJS default.
 * @param {number|null} [weight=null] - Positive integer chance weight relative to other entries in this pool. Omit/null for LootJS default.
 *
 * @returns {{output: Object, stack: (number|number[]|null), weight: (number|null)}} Data object consumed by `lootAddLootTable`.
 *
 * @example
 * // Creates an entry with a fixed stack size and weight.
 * lootPoolOutput(itemOutput('minecraft:blaze_rod'), 1, 20);
 *
 * @example
 * // Creates an entry with a stack size range and weight.
 * lootPoolOutput(itemOutput('minecraft:diamond'), [2, 6], 40);
 *
 * @example
 * // Creates an entry using the default stack size and weight.
 * lootPoolOutput(itemOutput('minecraft:emerald'));
 *
 * @example Output as an object
 * lootPoolOutput({ id: 'minecraft:emerald' });
 *
 * @example Output using itemOutput()
 * lootPoolOutput(itemOutput('minecraft:emerald'));
 */
function lootPoolOutput(output, stack, weight) {
    let stackOutput = null;
    let weightOutput = null;

    if (
        typeof stack === "number" &&
        Number.isSafeInteger(stack) &&
        stack > 0
    ) {
        stackOutput = stack;
    } else if (Array.isArray(stack)) {
        stackOutput = stack;
    }

    if (
        typeof weight === "number" &&
        Number.isSafeInteger(weight) &&
        weight > 0
    ) {
        weightOutput = weight;
    }

    return {
        output: output,
        stack: stackOutput,
        weight: weightOutput
    };
}
// === LootJS entries, conditions, functions, and filters ===
/**
 * Forwards a call to a LootJS static builder. Builder types are `entry`, `condition`, `function`, `filter`, `number`, `range`, and `type`.
 *
 * @param {string} type Builder family.
 * @param {string} method Exact LootJS method or enum member.
 * @param {...*} args Arguments forwarded to the method.
 * @returns {*} Native LootJS value, or null if the method is missing.
 * @example lootBuilder("condition", "randomChance", 0.25);
 */
function lootBuilder(type, method) {
    var builder;
    switch (type) {
        case "entry": builder = LootEntry; break;
        case "condition": builder = LootCondition; break;
        case "function": builder = LootFunction; break;
        case "filter": builder = ItemFilter; break;
        case "number": builder = NumberProvider; break;
        case "range": builder = Range; break;
        case "type": builder = LootType; break;
        default: builder = null;
    }
    if (!builder || typeof method !== "string") {
        console.error("lootBuilder: unsupported LootJS builder type or method.");
        return null;
    }
    var args = Array.prototype.slice.call(arguments, 2);
    var member = builder[method];
    if (typeof member === "function") return member.apply(builder, args);
    if (args.length === 0 && member !== undefined) return member;
    console.error(`[Loot] Unknown ${type} builder: ${method}`);
    return null;
}

/**
 * Creates an item LootEntry by forwarding its arguments to `LootEntry.of`.
 *
 * @param {string|Object} item Namespaced item ID or LootJS item value.
 * @param {...*} args Optional count or number-provider arguments.
 * @returns {Object} Native LootEntry builder.
 * @example lootEntryItem("minecraft:diamond");
 */
function lootEntryItem(item) { return lootBuilder.apply(null, ["entry", "of"].concat(Array.prototype.slice.call(arguments))); }
/**
 * Creates a tag LootEntry.
 *
 * @param {string} tag Namespaced item tag.
 * @param {boolean} expanded Optional tag expansion behavior.
 * @returns {Object} Native LootEntry builder.
 */
function lootEntryTag(tag, expanded) {
    return expanded === undefined
        ? lootBuilder("entry", "tag", tag)
        : lootBuilder("entry", "tag", tag, expanded);
}
/**
 * Creates an empty LootEntry.
 *
 * @returns {Object} Native empty LootEntry builder.
 */
function lootEntryEmpty() { return lootBuilder("entry", "empty"); }
/**
 * Creates an entry that rolls the contents of another loot table.
 *
 * @param {string} table Namespaced loot table ID.
 * @returns {Object} Native table-reference LootEntry builder.
 */
function lootEntryReference(table) { return lootBuilder("entry", "reference", table); }
/**
 * Selects the first child entry whose conditions succeed.
 *
 * @param {...Object} entries Child LootEntry values, passed as separate arguments.
 * @returns {Object} Native composite LootEntry.
 */
function lootEntryAlternative() { return lootBuilder.apply(null, ["entry", "alternative"].concat(Array.prototype.slice.call(arguments))); }
/**
 * Processes child entries until one condition fails.
 *
 * @param {...Object} entries Child LootEntry values, passed as separate arguments.
 * @returns {Object} Native composite LootEntry.
 */
function lootEntrySequence() { return lootBuilder.apply(null, ["entry", "sequence"].concat(Array.prototype.slice.call(arguments))); }
/**
 * Processes all child entries.
 *
 * @param {...Object} entries Child LootEntry values, passed as separate arguments.
 * @returns {Object} Native composite LootEntry.
 */
function lootEntryGroup() { return lootBuilder.apply(null, ["entry", "group"].concat(Array.prototype.slice.call(arguments))); }

/**
 * Calls a LootJS static condition builder by method name and forwards the remaining arguments.
 *
 * @param {string} method Exact static method name.
 * @param {...*} args Arguments for that method.
 * @returns {*} Native LootJS builder value.
 * @example lootCondition("randomChance", 0.25);
 */
function lootCondition(method) {
    return lootBuilder.apply(null, ["condition"].concat(Array.prototype.slice.call(arguments)));
}
/**
 * Calls a LootJS static function builder by method name and forwards the remaining arguments.
 *
 * @param {string} method Exact static method name.
 * @param {...*} args Arguments for that method.
 * @returns {*} Native LootJS builder value.
 * @example lootFunction("setCount", [1, 3]);
 */
function lootFunction(method) {
    return lootBuilder.apply(null, ["function"].concat(Array.prototype.slice.call(arguments)));
}
/**
 * Calls a LootJS static filter builder by method name and forwards the remaining arguments.
 *
 * @param {string} method Exact static method name.
 * @param {...*} args Arguments for that method.
 * @returns {*} Native LootJS builder value.
 * @example lootFilter("hasEnchantment", "minecraft:fortune");
 */
function lootFilter(method) {
    return lootBuilder.apply(null, ["filter"].concat(Array.prototype.slice.call(arguments)));
}
/**
 * Calls a LootJS static number builder by method name and forwards the remaining arguments.
 *
 * @param {string} method Exact static method name.
 * @param {...*} args Arguments for that method.
 * @returns {*} Native LootJS builder value.
 */
function lootNumberProvider(method) {
    return lootBuilder.apply(null, ["number"].concat(Array.prototype.slice.call(arguments)));
}
/**
 * Calls a LootJS static range builder by method name and forwards the remaining arguments.
 *
 * @param {string} method Exact static method name.
 * @param {...*} args Arguments for that method.
 * @returns {*} Native LootJS builder value.
 */
function lootRange(method) {
    return lootBuilder.apply(null, ["range"].concat(Array.prototype.slice.call(arguments)));
}
/**
 * Returns a LootType enum value by its name.
 *
 * @param {string} name Enum member, such as `CHEST` or `ENTITY`.
 * @returns {*} Native LootType value, or null if the member is unavailable.
 */
function lootType(name) { return lootBuilder("type", name); }

/* Apply a list like [{method: "randomChance", args: [0.2]}] to a builder. */
function lootApply(builder, calls) {
    if (!Array.isArray(calls)) calls = [calls];
    for (var i = 0; i < calls.length; i++) {
        var call = calls[i];
        if (!call || typeof call.method !== "string") {
            console.error(`[Loot] Invalid builder call at index ${i}.`);
            continue;
        }
        var args = Array.isArray(call.args) ? call.args : [];
        if (typeof builder[call.method] !== "function") {
            console.error(`[Loot] Unsupported LootJS method: ${call.method}`);
            continue;
        }
        builder[call.method].apply(builder, args);
    }
    return builder;
}

/**
 * Applies common entry fields and callbacks to a native LootEntry.
 *
 * @param {Object} entry LootEntry builder.
 * @param {Object} options Supported keys: weight, quality, count, chance, conditions, when, functions, apply.
 * @returns {Object} Configured LootEntry builder.
 * @remarks `chance: 0.1` means a 10% roll, so about 90% of eligible drops will not include the entry.
 * LootJS documents `setCount` behavior as different in `LootJS.modifiers`; use count options mainly for loot-table entries.
 */
function lootEntryOptions(entry, options) {
    if (!options) return entry;
    if (options.weight != null) entry = entry.withWeight(options.weight);
    if (options.quality != null) entry = entry.withQuality(options.quality);
    if (options.count != null) entry = entry.setCount(options.count);
    if (typeof options.chance === "number") {
        entry = entry.when(conditions => conditions.randomChance(options.chance));
    }
    if (options.conditions != null) {
        entry = entry.when(conditions => lootApply(conditions, options.conditions));
    }
    if (typeof options.when === "function") entry = entry.when(options.when);
    if (options.functions != null) {
        entry = entry.apply(functions => lootApply(functions, options.functions));
    }
    if (typeof options.apply === "function") entry = entry.apply(options.apply);
    return entry;
}

/**
 * Creates an item entry and applies options.
 *
 * @param {string} item Namespaced item ID.
 * @param {Object} options Optional entry options accepted by `lootEntryOptions`.
 * @returns {Object} Configured LootEntry.
 */
function lootItem(item, options) {
    return lootEntryOptions(LootEntry.of(item), options);
}
/**
 * Creates a tag entry and applies options.
 *
 * @param {string} tag Namespaced item tag.
 * @param {boolean} expanded Optional tag expansion flag.
 * @param {Object} options Optional entry options accepted by `lootEntryOptions`.
 * @returns {Object} Configured LootEntry.
 */
function lootTag(tag, expanded, options) {
    var entry = expanded === undefined ? LootEntry.tag(tag) : LootEntry.tag(tag, expanded);
    return lootEntryOptions(entry, options);
}
/**
 * Creates an empty entry and applies options.
 *
 * @param {Object} options Optional entry options accepted by `lootEntryOptions`.
 * @returns {Object} Configured empty LootEntry.
 */
function lootEmpty(options) {
    return lootEntryOptions(LootEntry.empty(), options);
}
/**
 * Creates a table-reference entry and applies options.
 *
 * @param {string} table Namespaced loot table ID.
 * @param {Object} options Optional entry options accepted by `lootEntryOptions`.
 * @returns {Object} Configured LootEntry.
 */
function lootReference(table, options) {
    return lootEntryOptions(LootEntry.reference(table), options);
}
/**
 * Creates an alternative, sequence, or group entry from child entries.
 *
 * @param {string} kind `alternative`, `sequence`, or `group`.
 * @param {Object[]} entries Non-empty child LootEntry array.
 * @param {Object} options Optional entry options.
 * @returns {Object|null} Composite entry, or null for invalid kind/entries.
 */
function lootComposite(kind, entries, options) {
    if (!Array.isArray(entries) || entries.length === 0) return null;
    var method = { alternative: "alternative", sequence: "sequence", group: "group" }[kind];
    if (!method) return null;
    var entry = LootEntry[method].apply(LootEntry, entries);
    return lootEntryOptions(entry, options);
}

/**
 * Configures common LootPool fields and optionally adds entries.
 *
 * @param {Object} pool LootPool builder.
 * @param {Object} options Supported keys: name, rolls, bonusRolls, conditions, when, functions, apply, entries.
 * @returns {Object} Configured pool.
 */
function lootPoolOptions(pool, options) {
    if (!pool || !options) return pool;
    if (options.name != null) pool.name(options.name);
    if (options.rolls != null) pool.rolls(options.rolls);
    if (options.bonusRolls != null) pool.bonusRolls(options.bonusRolls);
    if (options.conditions != null) pool.when(conditions => lootApply(conditions, options.conditions));
    if (typeof options.when === "function") pool.when(options.when);
    if (options.functions != null) pool.apply(functions => lootApply(functions, options.functions));
    if (typeof options.apply === "function") pool.apply(options.apply);
    if (Array.isArray(options.entries)) options.entries.forEach(entry => pool.addEntry(entry));
    return pool;
}

/**
 * Adds an entry to a pool.
 *
 * @param {Object} pool LootPool builder.
 * @param {string|Object} entry Item ID or LootEntry.
 * @returns {*} Native LootPool result, or null if the pool has no addEntry method.
 */
function lootAddEntry(pool, entry) {
    return pool && typeof pool.addEntry === "function" ? pool.addEntry(entry) : null;
}

/**
 * Gets or creates the table first pool and optionally configures it.
 *
 * @param {Object} table LootTable builder.
 * @param {Function} configure Optional callback receiving the pool.
 * @returns {Object|null} LootPool builder.
 */
function lootFirstPool(table, configure) {
    if (!table || typeof table.firstPool !== "function") return null;
    var pool = table.firstPool();
    if (typeof configure === "function") configure(pool);
    return pool;
}

/**
 * Adds a new table pool and optionally configures it.
 *
 * @param {Object} table LootTable builder.
 * @param {Function} configure Optional callback receiving the new pool.
 * @returns {Object|null} LootPool builder.
 */
function lootCreatePool(table, configure) {
    if (!table || typeof table.createPool !== "function") return null;
    var pool = table.createPool();
    if (typeof configure === "function") configure(pool);
    return pool;
}

/**
 * Clears pools and functions from a table.
 *
 * @param {Object} table LootTable builder.
 * @returns {*} Native LootJS result, or null if unsupported.
 */
function lootTableClear(table) {
    return table && typeof table.clear === "function" ? table.clear() : null;
}

/**
 * Registers a callback that runs when the table is rolled.
 *
 * @param {Object} table LootTable builder.
 * @param {Function} callback Receives LootContext and the rolled loot list.
 * @returns {*} Native LootJS result, or null if unsupported.
 */
function lootTableOnDrop(table, callback) {
    return table && typeof table.onDrop === "function" ? table.onDrop(callback) : null;
}

/**
 * Prints a table using LootJS for debugging.
 *
 * @param {Object} table LootTable builder.
 * @returns {*} Native LootJS result, or null if unsupported.
 */
function lootTablePrint(table) {
    return table && typeof table.print === "function" ? table.print() : null;
}

/**
 * Applies method descriptors to a LootModifier. Uses the same descriptor shape as `lootApply`.
 *
 * @param {Object} modifier LootModifier builder.
 * @param {Object|Array} calls Descriptor(s), such as `{ method: "addLoot", args: ["minecraft:apple"] }`.
 * @returns {Object} Configured modifier.
 */
function lootModifierApply(modifier, calls) {
    return lootApply(modifier, calls);
}
