const gulp = require('gulp');
const del = require('del');
const path = require('path');
const watch = require('gulp-watch');
const modifyFile = require('gulp-modify-file');
const utils = require('./lib/utils');
const rootDir = require('app-root-path').path;
const argv = require('yargs').argv;

const appDir = path.join(rootDir, 'app');
const SPEC_SRC = appDir + '/**/*.spec.js';
const SPEC_DIST = appDir + '/tests/.tmp';

gulp.task('clean:tests', () => {
    return del(appDir + '/tests/.tmp', {force: true});
});

gulp.task('watch:tests', ['clean:tests'], () => {
    const specFiles = utils.parseFlag(argv.spec);
    let targetSrc = SPEC_SRC;
    if (specFiles.length > 0 && specFiles[0] !== '') {
        targetSrc = specFiles.map(specFile => appDir + '/**/*' + specFile + '*.spec.js');
    }
    return watch(targetSrc, {ignoreInitial: false})
        .pipe(modifyFile(relativeRequireFileModifier(appDir)))
        .pipe(gulp.dest(SPEC_DIST));
});


const requirePathPrefix = 'require("';
const requirePathSuffix = '")';

function getPathOfRequire(relativeRequire) {
    return relativeRequire.substring(requirePathPrefix.length, relativeRequire.length - requirePathSuffix.length);
}
/**
 * Converts relative require paths to paths relative to /app prefixed with ~.
 */
function relativeRequireFileModifier(appDir) {
    const relativeRequireRegex = /require\(["']{1}\.+\/[^)]+["']{1}\)/g;
    return (content, filePath) => {
        const relativeRequires = content.match(relativeRequireRegex) || [];
        relativeRequires.forEach((relativeRequire) => {
            const relativePath = getPathOfRequire(relativeRequire);
            const targetFilePath = path.join(filePath, '../', relativePath);
            if(targetFilePath.indexOf('/app') === -1) {
                throw Error('Trying to resolve a path outside the app folder: ' + targetFilePath);
            }
            const relativeToAppPath = targetFilePath
                .substring(appDir.length + 1, targetFilePath.length);

            const relativeToAppRequire = requirePathPrefix + '~/' + relativeToAppPath + requirePathSuffix;
            content = content.replace(relativeRequire, relativeToAppRequire)
        });
        return content;
    }
}
