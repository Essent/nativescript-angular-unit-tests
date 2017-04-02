const path = require('path');
const exec = require('child_process').exec;

function parseFlag(flagString = '') {
    if (flagString.length > 0) {
        if (flagString[0] === '[') {
            const contentString = flagString.substring(1, flagString.length - 1);
            return contentString.split(',');
        }
    }
    return [flagString];
}

function executeParallelCommands(configs, flags) {
    configs.forEach(config => validateConfig(config));
    const commands = configs.map(config => generateParallelCommand(config, flags));
    return exec('parallelshell ' + commands.reduce((result, command) => result + ' ' + command, ''),
        (error, stdout, stderr) => {
            if (error) {
                console.log(error.stack);
                console.log('Error code: ' + error.code);
                console.log('Signal received: ' + error.signal);
            }
            console.log('Child Process STDOUT: ' + stdout);
            console.log('Child Process STDERR: ' + stderr);
        });
}

function validateConfig(config) {
    if(config.flags === undefined || config.flags.map === undefined) {
        if(config.required !== undefined && config.required.length > 0) {
            throw 'Invalid config: Flags required but not whitelisted { flags: [] ... } \n' + JSON.stringify(config, null, 2);
        }
    }
    if (config.flags.indexOf('*') !== -1 || config.required === undefined) {
        return;
    }
    const isInValid = config.required.some(required => config.flags.indexOf(required.flag) === -1);
    if (isInValid) {
        throw ' Required flag not whitelisted ' + JSON.stringify(config, null, 2);
    }
}

function generateParallelCommand(config, rawFlags) {
    let flags = rawFlags
        .filter(acceptedFlags(config));
    validateFlags(config, flags);
    flags = convertFlagsToArguments(config, flags);
    return `\"${config.command}${flags.map(flag => ' ' + flag).join('')}\"`;
}

function acceptedFlags(config) {
    return (flag) => {
        const containsWildcard = config.flags.some(configFlag => configFlag === '*');
        if (containsWildcard) {
            if (config.ignore === undefined) {
                return true;
            }
            const isIgnored = config.ignore.some(configFlag => flag.indexOf('--' + configFlag + '=') !== -1);
            return !isIgnored;
        }
        return config.flags.some(configFlag => flag.indexOf('--' + configFlag + '=') !== -1);
    }
}

function validateFlags(config, flags) {
    if (config.required === undefined) {
        return true;
    }
    config.required.forEach(required => {
        const target = flags.filter(flag => flag.indexOf('--' + required.flag + '=') !== -1);
        if (target.length === 0) {
            throw 'Missing flag ' + required.flag;
        }
        target.forEach(input => {
            const isValid = required.values.some(value => '--' + required.flag + '=' + value === input);
            if (!isValid) {
                throw 'Bad input ' + required.flag + ' | Accepted values:' + required.values.map(value => ' ' + value);
            }
        })
    })
}

function convertFlagsToArguments(config, flags) {
    if (config.required === undefined) {
        return flags;
    }
    config.required.forEach(required => {
        const index = flags.findIndex(flag => flag.indexOf('--' + required.flag + '=') !== -1);
        if (index === -1) {
            return;
        }
        flags[index] = flags[index].substring(2 + required.flag.length + 1, flags[index].length);
    });
    return flags;
}

const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const Reset = "\x1b[0m";

/**
 * Some colors of the unit test runner disappear.
 * This function checks for some indications of
 * success/failure and colors them green/red.
 */
function recolorAndPrint(data) {
    let successes = data.match(/(NativeScript[\w \d \/(;):.+]+(SUCCESS)+[\w \d \/(;):.+]+secs\))/);
    if (successes) {
        data = data
            .replace(successes[0], FgGreen + successes[0] + Reset);
    }
    let failures = data.match(/(NativeScript[\w \d \/(;):.+]+(FAILED)+[\w \d \/(;):.+]+secs\))/);
    if (failures && failures[0]) {
        const errorText = 'AssertionError:';
        data = data
            .replace(failures[0], FgRed + failures[0] + Reset)
            .replace(errorText, FgRed + errorText + Reset)
    }

    failures = data.match(/(NativeScript[\w \d \/(;):.+][\w \d \/(;):.+]+FAILED\s)/);
    if (failures && failures[0]) {
        data = data
            .replace(failures[0], FgRed + failures[0] + Reset);
    }

    process.stdout.write(data);
}

module.exports = {
    parseFlag: parseFlag,
    executeParallelCommands: executeParallelCommands,
    recolorAndPrint: recolorAndPrint
};
