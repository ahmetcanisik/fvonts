#!/usr/bin/env node
import { Command } from "commander";
import { version } from "../package.json";
import { Template } from "./template";

if (require.main === module) {
    const program = new Command();

    program
        .name("fvonts")
        .description("Fvonts, Self-host Fonts")
        .version(version);

    program
        .command("new")
        .description("Fvonts - Creating New Fonts with using Template")
        .argument("<string>", "string to template")
        .option("--files", "We state that we want to create a folder named Files.")
        .option("-e, --exclude-extension <string>", "Don't touch this specify extension file")
        .option("-t, --template <directory>", "Template Directory")
        .option("-d, --destination <directory>", "Destination directory")
        .action((str: string, options: {
            excludeExtension?: string;
            files?: boolean;
            templateFolderPath?: string;
            destination?: string;
        }) => {
            Template.replace({
                fontName: str,
                excludeExtension: options.excludeExtension,
                files: options.files,
                destination: options.destination,
                templateFolderPath: options.templateFolderPath,
            });
        });

    program.parse(process.argv);
}
