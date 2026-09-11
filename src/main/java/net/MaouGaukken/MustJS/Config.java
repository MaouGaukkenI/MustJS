package net.MaouGaukken.MustJS;

import net.neoforged.neoforge.common.ModConfigSpec;

public class Config {
    private static final ModConfigSpec.Builder BUILDER = new ModConfigSpec.Builder();

    public static final ModConfigSpec.BooleanValue ADD_BASE = BUILDER
            .comment("Generate the functions for creating Create mod recipes")
            .define("generateBase", true);

    public static final ModConfigSpec.BooleanValue ADD_ITEM_MANIPULATOR = BUILDER
            .comment("Generate the functions for item manipulation in recipes")
            .define("generateItemManipulator", true);

    public static final ModConfigSpec.BooleanValue ADD_FLUID_MANIPULATOR = BUILDER
            .comment("Generate the functions for fluid manipulation in recipes")
            .define("generateFluidManipulator", true);

    static final ModConfigSpec SPEC = BUILDER.build();
}
