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

    public static final ModConfigSpec.BooleanValue ADD_APPLIED = BUILDER
            .comment("Generate the functions for Applied Energistics 2 recipes")
            .define("generateApplied", true);

    public static final ModConfigSpec.BooleanValue ADD_EXTRA_CREATE = BUILDER
            .comment("Generate the extra functions for Create mod recipes")
            .define("generateExtraCreate", true);

    public static final ModConfigSpec.BooleanValue ADD_MINECRAFT = BUILDER
            .comment("Generate the functions for Minecraft recipes and item tags")
            .define("generateMinecraft", true);

    public static final ModConfigSpec.BooleanValue ADD_REMOVE = BUILDER
            .comment("Generate the functions for removing and replacing recipes")
            .define("generateRemove", true);

    static final ModConfigSpec SPEC = BUILDER.build();
}
