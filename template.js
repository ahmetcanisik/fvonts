#!/usr/bin/env node
const fs = require("node:fs/promises");
const path = require("node:path");
const { ProjectInfo } = require("./info");

class Utils {
    static capitalizeFontName(templateName) {
        return templateName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    static escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

class Filer {
    static async read_file(file) {
        return await fs.readFile(file, "utf8");
    }

    static async write_file(file, content) {
        try {
            await fs.writeFile(file, content, "utf8");
        } catch (err) {
            console.error("Filer.write_file() fonksiyonu çalıştırılırken bir sorun oluştu!\nDosya yazma işlemi sırasında bir hata meydana geldi!\n", err);
        }
    }

    static async make_dir(dir) {
        try {
            await fs.mkdir(dir, { recursive: true });
            console.log(`${dir} adresinde yeni klasör başarıyla oluşturuldu!`);
        } catch (err) {
            console.error("Filer.make_dir() fonksiyonu çalışırken bir sorun oluştu!\nKlasör oluşturma esnasında bir hata meydana geldi.\n", err);
        }
    }
}

class Template {
    static async replace({ fontName = "example-font", destination = ".", noCss = false, templateFolderPath = path.join(".", "template") } = {}) {
        try {
            const project = ProjectInfo.parse;
            const config = {
                prefix: "$fv",
                replacements: {
                    'fontName': fontName,
                    'version': project.version || "0.0.1",
                    'githubRepository': `https://github.com/ahmetcanisik/fvonts/tree/main/${fontName}`,
                    'author': project.author.name || "your",
                    'license': project.license || "MIT",
                    'fontTitle': Utils.capitalizeFontName(fontName),
                }
            }
            const files = await fs.readdir(templateFolderPath);
            const targetDir = path.join(destination, fontName);
            await Filer.make_dir(targetDir);
            await Filer.make_dir(path.join(targetDir, "files"));

            for (const file of files) {
                const srcPath = path.join(templateFolderPath, file);
                const destPath = path.join(targetDir, file);
                const fileExt = path.extname(srcPath);
                let fileContent = await Filer.read_file(srcPath);

                for (const [placeholder, value] of Object.entries(config.replacements)) {
                    const prefix = `${config.prefix}.${placeholder}`;
                    const regex = new RegExp(Utils.escapeRegex(prefix), 'g');
                    if (noCss && fileExt === ".css") {
                        continue;
                    }
                    fileContent = fileContent.replace(regex, value);
                    await Filer.write_file(destPath, fileContent);
                }
            }
        } catch (err) {
            console.log(`\ntemplate.replace() fonksiyonu çalıştırılırken bir sorun oluştu!\n${err}`);
        }
    }
}

if (require.main === module) {
    Template.replace();
}

module.exports = {
    Template,
};
