#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { Utils } from "./utils";

const nowDir = process.cwd();

class Filer {
    static async readFile(file: string): Promise<string> {
        return await fs.readFile(file, "utf8");
    }

    static async writeFile(file: string, content: string): Promise<void> {
        try {
            await fs.writeFile(file, content, "utf8");
        } catch (err) {
            console.error(
                "Filer.writeFile() sırasında bir sorun oluştu! Dosya yazılamadı.",
                err
            );
        }
    }

    static async makeDir(dir: string): Promise<void> {
        try {
            await fs.mkdir(dir, { recursive: true });
            console.log(`${dir} klasörü başarıyla oluşturuldu!`);
        } catch (err) {
            console.error(
                "Filer.makeDir() sırasında bir sorun oluştu! Klasör oluşturulamadı.",
                err
            );
        }
    }
}

interface ReplaceOptions {
    fontName?: string;
    destination?: string;
    excludeExtension?: string;
    files?: boolean;
    templateFolderPath?: string;
}

export class Template {
    static async replace({
        fontName = "example-font",
        destination = nowDir,
        excludeExtension = "",
        files = false,
        templateFolderPath = path.join(nowDir, "template"),
    }: ReplaceOptions = {}): Promise<void> {
        try {
            const conf = {
                prefix: "$fv",
                replacements: {
                    ...(await import(path.join(nowDir, "package.json"))),
                    title: Utils.capitalizeFontName(fontName),
                },
            };

            try {
                const { config } = await import(
                    path.join(nowDir, "fvonts.config.js")
                );
                if (config.replacements) {
                    conf.replacements = {
                        ...conf.replacements,
                        ...config.replacements,
                    };
                }
            } catch {
                console.error("fvonts.config.js dosyası bulunamadı!");
            }

            conf.replacements.name = fontName;

            try {
                if (!conf.replacements.github) {
                    conf.replacements.github = conf.replacements.repository.url.replace(
                        "git+",
                        ""
                    );
                }
            } catch (e) {
                console.error(
                    "github replacement işlenirken bir sorun oluştu!",
                    e
                );
            }

            const filesInTemplate = await fs.readdir(templateFolderPath);
            const targetDir = path.join(destination, fontName);
            await Filer.makeDir(targetDir);

            if (files === true) {
                await Filer.makeDir(path.join(targetDir, "files"));
            }

            for (const file of filesInTemplate) {
                const srcPath = path.join(templateFolderPath, file);
                const destPath = path.join(targetDir, file);
                const fileExt = path.extname(srcPath);
                let fileContent = await Filer.readFile(srcPath);

                for (const [placeholder, value] of Object.entries(
                    conf.replacements
                )) {
                    const prefix = `${conf.prefix}.${placeholder}`;
                    const regex = new RegExp(Utils.escapeRegex(prefix), "g");

                    if (
                        excludeExtension.includes(",")
                            ? excludeExtension
                                  .split(",")
                                  .map((ext) =>
                                      ext.startsWith(".") ? ext : `.${ext}`
                                  )
                                  .includes(fileExt)
                            : (excludeExtension.startsWith(".")
                                  ? excludeExtension
                                  : `.${excludeExtension}`) === fileExt
                    )
                        continue;

                    if (typeof value === "string") fileContent = fileContent.replace(regex, value);
                    await Filer.writeFile(destPath, fileContent);
                }
            }
        } catch (err) {
            console.error(
                "Template.replace() sırasında bir sorun oluştu!",
                err
            );
        }
    }
}

// Eğer bu dosya direkt çalıştırılırsa, Template.replace() çağrılır
if (require.main === module) {
    Template.replace();
}