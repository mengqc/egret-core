const gulp = require("gulp");
const argv = require('yargs').argv;
const compile_engine = require('./compile_engine');
const fs = require('fs');
const os = require('os');
const path = require('path');
const fsEx = require('fs-extra');
const { tr } = require("./tools/lib/utils");


const deployDir = '/Users/mengqc/Library/Application Support/Egret/engine/5.2.25/build';

async function build() {

  const isPublish = true;
  const srcPath = './src/egret/';
  const outFile = 'dist/egret/egret.js';


  compile_engine.clear('./dist/egret');
  compile_engine.compile(srcPath, outFile, isPublish, { declaration: true }, null, (fileName, index, array) => {
    if (fileName.indexOf('WebGLUtils') > -1) return true;
    if (fileName.indexOf('web/') > -1) return false;
    return true;
  });
  compile_engine.minify(outFile, 'dist/egret/egret.min.js');

  compile_engine.compile(srcPath, 'dist/egret/egret.web.js', isPublish, { declaration: false }, ['dist/egret/egret.d.ts'], (fileName, index, array) => {
    if (fileName.indexOf('web/') > -1) return true;
    return false;
  });
  compile_engine.minify(outFile, 'dist/egret/egret.web.min.js');
}
exports.build = build;

async function deploy() {
  const targetDir = path.join(deployDir, 'egret');
  const bakDir = path.join(deployDir, 'egret.bak');
  const srcDir = 'dist/egret';
  if (!fs.existsSync(bakDir)) {
    fs.renameSync(targetDir, bakDir);
  }
  fsEx.copySync(srcDir, targetDir);
}
exports.deploy = deploy;

async function fallback() {
  const targetDir = path.join(deployDir, 'egret');
  const bakDir = path.join(deployDir, 'egret.bak');
  if (!fs.existsSync(bakDir)) return;
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true });
  }
  fs.renameSync(bakDir, targetDir);
}
exports.fallback = fallback;


async function build_deploy() {
  await build();
  await deploy();
}
exports.build_deploy = build_deploy;