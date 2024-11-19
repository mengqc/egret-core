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
    console.log('Compile Complete');
}

function clear(destPath) {
    if (!fs.existsSync(destPath)) return;
    fs.rmSync(destPath, { recursive: true });
}


const isPublish = true;
const srcPath = './src/egret/';
const outFile = 'dist/egret/egret.js';


clear('./dist/egret');
compile(srcPath, outFile, isPublish, { declaration: true }, null, (fileName, index, array) => {
    if (fileName.indexOf('WebGLUtils') > -1) return true;
    if (fileName.indexOf('web/') > -1) return false;
    return true;
});
utils.minify(outFile, 'dist/egret/egret.min.js');

compile(srcPath, 'dist/egret/egret.web.js', isPublish, { declaration: false }, ['dist/egret/egret.d.ts'], (fileName, index, array) => {
    if (fileName.indexOf('web/') > -1) return true;
    return false;
});
utils.minify(outFile, 'dist/egret/egret.web.min.js');
