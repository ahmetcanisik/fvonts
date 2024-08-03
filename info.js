#!/usr/bin/env node
const fs = require("node:fs");

class ProjectInfo {
    static read_package_json(file_path = "package.json") {
        const read_file = fs.readFileSync(file_path, "utf8", fs.constants.O_RDONLY);
        return read_file;
    }

    static get parse() {
        return JSON.parse(ProjectInfo.read_package_json());
    }
}

module.exports = {
    ProjectInfo,
}