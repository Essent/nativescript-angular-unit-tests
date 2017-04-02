#!/usr/bin/env node
const path = require('path');
const gulpDir = path.join(__dirname, '../');
const nodeAndFileLocation = 2;
const flags = process.argv.splice(nodeAndFileLocation, process.argv.length);
const {executeParallelCommands, recolorAndPrint} = require('../lib/utils');

const gulp = {
    command: 'gulp watch:tests --cwd ' + gulpDir,
    flags: ['spec']
};

const tns = {
    command: 'tns test',
    flags: ['*'],
    ignore: gulp.flags,
    required: [
        {
            flag: 'platform',
            values: ['android', 'ios'],
            asArgument: true
        }
    ]
};

const testProcess = executeParallelCommands([gulp, tns], flags);
testProcess.stdout.on('data', recolorAndPrint);
