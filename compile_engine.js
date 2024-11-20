const Compiler = require('./tools/actions/Compiler');
const utils = require('./tools/lib/utils');
const fs = require('fs');

const compiler = new Compiler.Compiler();

function compile(srcPath, outFile, isPublish, options, exSrcList, filterFunc) {
    const configParsedResult = compiler.parseTsconfig(srcPath, isPublish);
    const compilerOptions = configParsedResult.options;
    let fileNames = configParsedResult.fileNames;
    if (filterFunc) {
        fileNames = fileNames.filter(filterFunc);
    }
    if (isPublish) {
        fileNames.push('src/Defines.release.ts');
    } else {
        fileNames.push('src/Defines.debug.ts');
    }
    if (exSrcList) {
        fileNames = fileNames.concat(exSrcList);
    }

    compilerOptions.outFile = outFile;
    compilerOptions.declaration = true;
    compilerOptions.allowUnreachableCode = true;
    compilerOptions.emitReflection = true;

    for (let key in options) {
        compilerOptions[key] = options[key];
    }

    const compilerHost = compiler.compile(compilerOptions, fileNames);
    if (compilerHost.messages && compilerHost.messages.length > 0) {
        global.exitCode = 1;
    }
}

function clear(destPath) {
    if (!fs.existsSync(destPath)) return;
    fs.rmSync(destPath, { recursive: true });
}

function minify(srcFile, outFile) {
    utils.minify(srcFile, outFile);
}

module.exports = {
    compile: compile,
    clear: clear,
    minify: minify,
}