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

    public MustJS(IEventBus modEventBus, ModContainer modContainer) {
        modContainer.registerConfig(ModConfig.Type.COMMON, Config.SPEC);

        // registra listener para quando a config for carregada
        modEventBus.addListener(this::onLoadConfig);
    }

    private void onLoadConfig(final ModConfigEvent event) {
        if (event.getConfig().getSpec() == Config.SPEC) {
            try {
                ModScripts.createReadme("README.txt");
                ModScripts.createReadme("LEIAME.txt");
                if (Config.ADD_BASE.get()) {
                    ModScripts.copyScript("CreateBaseFunctions.js");
                    LOGGER.info("Script CreateBaseFunctions.js copiado com sucesso!");
                } else {
                    ModScripts.deleteScript("CreateBaseFunctions.js");
                    LOGGER.info("Script CreateBaseFunctions.js removido!");
                }

                if (Config.ADD_FLUID_MANIPULATOR.get()) {
                    ModScripts.copyScript("FluidManipulator.js");
                    LOGGER.info("Script FluidManipulator.js copiado com sucesso!");
                } else {
                    ModScripts.deleteScript("FluidManipulator.js");
                    LOGGER.info("Script FluidManipulator.js removido!");
                }

                if (Config.ADD_ITEM_MANIPULATOR.get()) {
                    ModScripts.copyScript("ItemManipulator.js");
                    LOGGER.info("Script ItemManipulator.js copiado com sucesso!");
                } else  {
                    ModScripts.deleteScript("ItemManipulator.js");
                    LOGGER.info("Script ItemManipulator.js removido!");
                }
            } catch (IOException e) {
                LOGGER.error("Erro ao manipular script", e);
            }
        }
    }
}

