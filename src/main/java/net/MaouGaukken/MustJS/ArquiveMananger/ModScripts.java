package net.MaouGaukken.MustJS.ArquiveMananger;

import java.awt.*;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;

public class ModScripts {
    private static final String ORIGIN_FOLDER = "/templates/JavaScript";
    private static final Path DEST_FOLDER = Paths.get("kubejs/server_scripts/MustJs");
    private static final Path README_FOLDER = Paths.get("kubejs/server_scripts");


    public static void copyScript(String fileName) throws IOException {
        if (!Files.exists(DEST_FOLDER)) {
            Files.createDirectories(DEST_FOLDER);
        }

        String resourcePath = ORIGIN_FOLDER + "/" + fileName;
        Path targetFile = DEST_FOLDER.resolve(fileName);

        try (InputStream in = ModScripts.class.getResourceAsStream(resourcePath)) {
            if (in == null) {
                throw new IOException("Arquivo não encontrado no jar: " + resourcePath);
            }
            Files.copy(in, targetFile, StandardCopyOption.REPLACE_EXISTING);
        }
    }
    public static void createReadme(String fileName) throws IOException {
        if (!Files.exists(README_FOLDER)) {
            Files.createDirectories(README_FOLDER);
        }

        String resourcePath = ORIGIN_FOLDER + "/" + fileName;
        Path targetFile = README_FOLDER.resolve(fileName);

        try (InputStream in = ModScripts.class.getResourceAsStream(resourcePath)) {
            if (in == null) {
                throw new IOException("Arquivo não encontrado no jar: " + resourcePath);
            }
            Files.copy(in, targetFile, StandardCopyOption.REPLACE_EXISTING);
        }
    }
    public static void deleteScript(String fileName) throws IOException {
        if (!Files.exists(DEST_FOLDER)) {
            Files.createDirectories(DEST_FOLDER);
        }

        Path targetFile = DEST_FOLDER.resolve(fileName);

        if (Files.exists(targetFile)) {
            Files.delete(targetFile);
        }
    }
}
