package net.MaouGaukken.MustJS.ArquiveMananger;

import java.awt.*;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;

public class ModScripts {
    private static final String ORIGIN_FOLDER = "/templates/JavaScript";
    private static final Path DEST_FOLDER = Paths.get("kubejs/server_scripts/MustJs");
    private static final Path README_FOLDER = Paths.get("kubejs/server_scripts");
    private static final Path ADDONS_FOLDER = Paths.get("kubejs/server_scripts/MustJs/Addons");


    public static void copyScript(String fileName) throws IOException {
        copyScript(null, fileName);
    }

    public static void copyScript(String folder, String fileName) throws IOException {
        Path baseFolder = folder == null || folder.isBlank()
                ? DEST_FOLDER
                : ADDONS_FOLDER.resolve(folder);

        Files.createDirectories(baseFolder);

        String resourcePath = ORIGIN_FOLDER + "/" + fileName;
        Path targetFile = baseFolder.resolve(fileName);

        try (InputStream in = ModScripts.class.getClassLoader()
                .getResourceAsStream(resourcePath)) {

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
        deleteFile(DEST_FOLDER, fileName);
    }

    public static void deleteScript(String folder, String fileName) throws IOException {
        if (folder == null || folder.isBlank()) {
            deleteScript(fileName);
            return;
        }

        deleteFile(ADDONS_FOLDER.resolve(folder), fileName);
    }

    private static void deleteFile(Path baseFolder, String fileName) throws IOException {
        Path base = baseFolder.toAbsolutePath().normalize();
        Path target = base.resolve(fileName).normalize();

        if (!target.startsWith(base)) {
            throw new IOException("Caminho de arquivo inválido: " + fileName);
        }

        if (Files.deleteIfExists(target)) {
            // O arquivo foi encontrado e excluído.
        }
    }
}
