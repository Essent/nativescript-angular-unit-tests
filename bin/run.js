#!/usr/bin/env node
const path = require('path');
const gulpDir = path.resolve(__dirname, '../');
const nodeAndFileLocation = 2;
const flags = process.argv.splice(nodeAndFileLocation, process.argv.length);
const {executeParallelCommands, recolorAndPrint} = require('../lib/utils');

const onlyCopy = flags.some(flag => flag === '--justcopy');

const gulp = {
    command: 'gulp run:tests --cwd ' + gulpDir,
    flags: ['spec', 'justlaunch']
};

const tns = {
    command: 'tns test',
    flags: ['*', 'justlaunch'],
    ignore: gulp.flags,
    required: [
        {
            flag: 'platform',
            values: ['android', 'ios'],
            asArgument: true
        }
    ]
};
const processes = [gulp];

if(!onlyCopy) {
    processes.push(tns);
}

const testProcess = executeParallelCommands(processes, flags);
testProcess.stdout.on('data', recolorAndPrint);
testProcess.stdout.on('exit', recolorAndPrint);
