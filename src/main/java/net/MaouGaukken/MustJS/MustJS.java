package net.MaouGaukken.MustJS;

import net.MaouGaukken.MustJS.ArquiveMananger.ModScripts;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.ModContainer;
import net.neoforged.fml.common.Mod;
import net.neoforged.fml.config.ModConfig;
import net.neoforged.fml.event.config.ModConfigEvent;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;

@Mod(MustJS.MOD_ID)
public class MustJS {
    public static final String MOD_ID = "mustjs";
    private static final Logger LOGGER = LogManager.getLogger(MOD_ID);

    public MustJS(IEventBus modEventBus, ModContainer modContainer) throws IOException {
        modContainer.registerConfig(ModConfig.Type.COMMON, Config.SPEC);

        ModScripts.deleteMustJsFolder();
        // registra listener para quando a config for carregada
        modEventBus.addListener(this::onLoadConfig);
    }

    private void onLoadConfig(final ModConfigEvent event) {
        if (event.getConfig().getSpec() == Config.SPEC) {
            try {
                ModScripts.createReadme("README.txt");
                ModScripts.createReadme("LEIAME.txt");
            } catch (IOException e) {
                LOGGER.error("Erro ao criar os arquivos README", e);
            }

            syncScript(null, true, "MustJS.js");
            syncScript("Create", Config.ADD_BASE.get(), "CreateBaseFunctions.js");
            syncScript("Create", Config.ADD_EXTRA_CREATE.get(), "ExtraCreate.js");
            syncScript("AE2", Config.ADD_APPLIED.get(), "Applied.js");
            syncScript("Ars", Config.ADD_ARS_NOUVEAU.get(), "ArsNouveau.js");
            syncScript("Ars", Config.ADD_ARS_NOUVEAU.get(), "ArsManipulator.js");
            syncScript(null, Config.ADD_FLUID_MANIPULATOR.get(), "FluidManipulator.js");
            syncScript(null, Config.ADD_ITEM_MANIPULATOR.get(), "ItemManipulator.js");
            syncScript(null, Config.ADD_MINECRAFT.get(), "Minecraft.js");
            syncScript(null, Config.ADD_REMOVE.get(), "Remove.js");
        }
    }
    private static void syncScript(String folder, boolean enabled, String script) {
        try {
            if (enabled) {
                if (folder != null) {
                    ModScripts.copyScript(folder, script);
                    LOGGER.info("Script {}/{} copiado com sucesso!", folder, script);
                } else {
                    ModScripts.copyScript(script);
                    LOGGER.info("Script {}/{} copiado com sucesso!", script);
                }
            } else {
                ModScripts.deleteScript(folder, script);
                LOGGER.info("Script {}/{} removido!", folder, script);
            }
        } catch (IOException e) {
            LOGGER.error("Erro ao manipular script {}/{}", folder, script, e);
        }
    }
}
