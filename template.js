#!/usr/bin/env node
const nowDir = process.cwd();
const fs = require("node:fs/promises");
const path = require("node:path");
const { Utils } = require("./utils");

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
    static async replace({ fontName = "example-font", destination = nowDir, excludeExtension = "", files = false, templateFolderPath = path.join(nowDir, "template") } = {}) {
        try {
            const conf = {
                prefix: "$fv",
                replacements: {...require(path.join(nowDir, "package.json")), title: Utils.capitalizeFontName(fontName)}
            }

            try {
                const { config } = require(path.join(nowDir, "fvonts.config.js"));
                if (config.replacements) {
                    conf.replacements = {...conf.replacements, ...config.replacements}
                }
            } catch (e) { console.error("fvonts.config.js dosyası bulunamadı!") };

            conf.replacements.name = fontName;
            
            try {
                if (!conf.replacements.github) {
                    conf.replacements.github = conf.replacements.repository.url.replace("git+", '');
                }
            } catch (e) {
                console.error("github replacement'ı değiştirilirken bir sorun meydana geldi!", e);
            }

            const files = await fs.readdir(templateFolderPath);
            const targetDir = path.join(destination, fontName);
            await Filer.make_dir(targetDir);
            
            if (files === true) {
                await Filer.make_dir(path.join(targetDir, "files"));
            }

            for (const file of files) {
                const srcPath = path.join(templateFolderPath, file);
                const destPath = path.join(targetDir, file);
                const fileExt = path.extname(srcPath);
                let fileContent = await Filer.read_file(srcPath);


                for (const [placeholder, value] of Object.entries(conf.replacements)) {
                    const prefix = `${conf.prefix}.${placeholder}`;
                    const regex = new RegExp(Utils.escapeRegex(prefix), 'g');

                    if (excludeExtension.includes(",") 
                        ? excludeExtension.split(',')
                            .map(ext => ext.startsWith('.') ? ext : `.${ext}`)
                            .includes(fileExt)
                        : (excludeExtension.startsWith('.') ? excludeExtension : `.${excludeExtension}`) === fileExt) continue;

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
