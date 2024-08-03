#!/usr/bin/env node
const { Command } = require('commander');
const { version } = require("./package.json");
const { Template } = require("./template");

if (require.main === module) {
    const program = new Command();

    program.name("fvonts")
        .description("Fvonts, Self-host Fonts")
        .version(version);


    program.command("tmt")
        .description("Fvonts Font Template Generator")
        .argument("<string>", 'string to template')
        .option('--no-css', 'Don\'t touch css file')
        .option('-t, --target <directory>', 'Target directory')
        .action((str, options) => {
            Template.replace({
                fontName: str,
                noCss: options.noCss,
                target: options.target
            });
        })

    program.parse(process.argv);
}