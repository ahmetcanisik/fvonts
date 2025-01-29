#!/usr/bin/env node
const { Command } = require('commander');
const { version } = require("./package.json");
const { Template } = require("./template");

// en iyisimi boş verip aldırmamalı
if (require.main === module) {
    const program = new Command();

    program.name("fvonts")
        .description("Fvonts, Self-host Fonts")
        .version(version);


    program.command("new")
        .description("Fvonts - Creating New Fonts with using Template")
        .argument("<string>", 'string to template')
        .option('--files', "We state that we want to create a folder named Files.")
        .option('-e, --exclude-extension <string>', 'Don\'t touch this specify extension file')
        .option('-t, --template <directory>', 'Template Directory')
        .option('-d, --destination <directory>', 'Destination directory')
        .action((str, options) => {
            Template.replace({
                fontName: str,
                excludeExtension: options.excludeExtension,
                noFiles: options.files,
                destination: options.destination,
                templateFolderPath: options.template
            });
        })

    program.parse(process.argv);
}