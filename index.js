#!/usr/bin/env node
/**
 * npm publish yazmak yerine node push.js yazacağım. hatta node push.js i package.json içerisinde script altına
 * alıp yarn publish bile yazabilirim
 */
const { Command } = require('commander');
const { version } = require("./package.json");
const { Template } = require("./template");

if (require.main === module) {
    const program = new Command();

    program.name("fvonts")
        .description("Fvonts, Self-host Fonts")
        .version(version);


    program.command("template")
        .description("Font template generator")
        .argument("<string>", 'string to template')
        .option('--no-css', 'Don\'t touch css file')
        .action((str, options) => {
            const template = new Template(str, options.noCss ? false : true);
            template.replace();
        })

    program.parse(process.argv);
}