#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');

// Basit bir sınıf ile package.json dosyalarını okumak için
class ReadJson {
    // Verilen dosya yolunu okuyarak JSON içeriğini döner
    static async parse(filePath = "package.json") {
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (err) {
            console.error('Ups! Something went wrong!', err);
            throw err; // Hata oluşursa, üst seviyede işlenmesi için hata fırlatılır
        }
    }
}

// Template işlemlerini yöneten sınıf
class Template {
    constructor(templateName = 'example-font', css = true) {
        this.fonts = {
            "fonts": []
        }
        this.css = css;
        this.templateName = templateName;
        this.outputDir = path.join(__dirname, templateName);
        this.replacements = {
            '$font-name': templateName,
            '$version': '0.0.5', // Bu değer package.json'dan alınacak
            '$github_repository': 'https://github.com/ahmetcanisik/fvonts/'+templateName,
            '$author': 'ahmetcanisik',
            '$license': 'MIT',
            '$[title]': this.capitalizeTemplateName(templateName),
        };
    }

    // Yeni dizini oluşturur ve içerisine files klasörünü oluşturur.
    async createDirectory() {
        try {
            await fs.mkdir(this.outputDir, { recursive: true });
            console.log(`Directory created successfully: ${this.outputDir}`);
            
            const filesDir = path.join(this.outputDir, "files");
            await fs.mkdir(filesDir, { recursive: true });
            console.log(`Directory created successfully: ${filesDir}`);
        } catch (err) {
            console.error('Error creating directory:', err);
        }
    }

    async copyLicenseFile(destination = "template") {
        try {
            const licenseLocation = path.join(__dirname, "LICENSE")
            await fs.copyFile(licenseLocation, destination);
            console.log(`${licenseLocation} dosyası şuraya kopyalandı ${destination}`)
        } catch(err) {
            console.error("Ups! There was a problem copying the license file.", err)
        }
    }

    async getPackageJson() {
        const templateConfigPath = path.join(__dirname, 'template', 'config.json');
            // config.json dosyasını bir string olarak oku
            let templateData = await fs.readFile(templateConfigPath, 'utf-8');

            // Ana package.json dosyasından versiyon bilgisini al
            const packageData = await ReadJson.parse(path.join(__dirname, 'package.json'));
            this.replacements['$version'] = packageData.version;

            // Yer tutucuları değiştirme
            for (const [placeholder, value] of Object.entries(this.replacements)) {
                const regex = new RegExp(escapeRegExp(placeholder), 'g');
                templateData = templateData.replace(regex, value);
            }

            // `templateData`'yı JSON nesnesine dönüştür
            let jsonData = JSON.parse(templateData);

            // Keywords özelliğine yeni anahtar kelimeler ekle
            if (!jsonData.keywords) {
                jsonData.keywords = [];
            }
            jsonData.keywords.push(this.templateName, `fvonts-${this.templateName}`, `${this.templateName}-font`, `npm-${this.templateName}`);

            // Yeni package.json dosyasını yaz
            const outputFilePath = path.join(this.outputDir, 'package.json');
            await fs.writeFile(outputFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
            console.log(`New package.json created successfully at: ${outputFilePath}`);
    }

    async replaceReadme() {
        try {
            const readmeTemplatePath = path.join(__dirname, 'template', 'README.md');
            let readmeData = await fs.readFile(readmeTemplatePath, 'utf-8');

            // Yer tutucuları değiştirme
            for (const [placeholder, value] of Object.entries(this.replacements)) {
                const regex = new RegExp(escapeRegExp(placeholder), 'g');
                readmeData = readmeData.replace(regex, value);
            }

            // Yeni README.md dosyasını yaz
            const outputFilePath = path.join(this.outputDir, 'README.md');
            await fs.writeFile(outputFilePath, readmeData, 'utf-8');
            console.log(`New README.md created successfully at: ${outputFilePath}`);
        } catch (err) {
            console.error('Error in replaceReadme operation:', err);
        }
    }

    async replaceIndexCss() {
        try {
            const indexCssTemplate = path.join(__dirname, "template", "index.css");
            let indexCssData = await fs.readFile(indexCssTemplate, "utf8");

            // yer tutucuları değiştirme
            for (const [placeholder, value] of Object.entries(this.replacements)) {
                const regex = new RegExp(escapeRegExp(placeholder), 'g');
                indexCssData = indexCssData.replace(regex, value);
            }

            const outputFilePath = path.join(this.outputDir, "index.css");
            await fs.writeFile(outputFilePath, indexCssData,  "utf8");
            console.log(`New ${outputFilePath} was created.`);
        } catch(err) {
            console.error('Ups! index.css dosyası okunurken bir sorun oluştu.', err)
        }
    }

    async getFonts() {
        try {
            const fontsPath = path.join(__dirname, "fonts.json");
            const data = await fs.readFile(fontsPath, 'utf-8');
            const jsonData = JSON.parse(data);
            this.fonts = jsonData.fonts || { "fonts": [] }; // fonts anahtarı yoksa boş dizi ata
        } catch (err) {
            console.error('Error reading fonts.json:', err);
            this.fonts = {"fonts": []}; // Hata durumunda da boş dizi ata
        }
    }

    async updateFonts() {
        try {
            // getFonts metodunu çağırarak fonts dizisini güncel tutun
            await this.getFonts();
    
            // Yeni fontu diziye ekle
            if (!this.fonts || !this.fonts.fonts) {
                this.fonts = { "fonts": [] }; // Eğer fonts eksikse, boş bir nesne oluştur
            }
    
            if (!this.fonts.fonts.includes(this.templateName)) {
                this.fonts.fonts.push(this.templateName);
            }
            
            // Güncellenmiş fonts.json dosyasını yazma
            const fontsPath = path.join(__dirname, "fonts.json");
            await fs.writeFile(fontsPath, JSON.stringify(this.fonts, null, 2), "utf-8");
    
            const npmignore = path.join(__dirname, ".npmignore");
            let shouldUpdate = true;
    
            for (const name of this.fonts.fonts) {
                if (name === this.templateName) {
                    shouldUpdate = false;
                    break;
                }
            }
    
            if (shouldUpdate) {
                await fs.appendFile(npmignore, `\n${this.templateName}`, "utf-8");
            }
        } catch (err) {
            console.error('Error updating fonts.json:', err);
        }
    }
    

    // Özel bir işlev: templateName baş harflerini büyük yapar ve tire işaretlerini kaldırır
    capitalizeTemplateName(templateName) {
        return templateName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // config.json dosyasındaki yer tutucuları değiştirir ve yeni package.json dosyasını oluşturur
    async replace() {
        try {
            await this.getFonts();
            this.replacements["$version"] = await ReadJson.parse()["version"];
            await this.createDirectory();
            await this.copyLicenseFile(path.join(this.outputDir, "LICENSE"));
            await this.getPackageJson();
            await this.replaceReadme();
            if (this.css) {
                await this.replaceIndexCss();
            }
            await this.updateFonts();
        } catch (err) {
            console.error('Error in replace operation:', err);
        }
    }
}

// Özel bir işlev: RegExp için özel karakterleri kaçır
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Eğer bu dosya doğrudan çalıştırılıyorsa
if (require.main === module) {
    const template = new Template();
    template.replace();
}

// Modülleri dışa aktar
module.exports = {
    Template,
    ReadJson,
};