const expect = require('chai').expect;
const utils = require('./../lib/utils');

/**
 * This modifier targets generated js files.
 */
describe('ModifyRequires input', () => {
    const appDir = '/home/me/workspace/project/app';
    const relativeRequireFileModifier = relativeRequireFileModifierFactory(appDir);
    const filePath = appDir + '/some/directory/deep/file.js';

    it('should not change if no requires are found', () => {
        let fileContent = 'Some text or code';
        let output = relativeRequireFileModifier(fileContent, filePath);
        expect(output).to.equal(fileContent);
    });
    it('should not change if no relative requires are found', () => {
        let fileContent = 'Some text or code require("someLib"); plus some other stuff';
        let output = relativeRequireFileModifier(fileContent, filePath);
        expect(output).to.equal(fileContent);
    });
    it('should not change if the path is relative to the app prefixed with ~', () => {
        let fileContent = 'Some text or code require("~/someLib"); plus some other stuff';
        let output = relativeRequireFileModifier(fileContent, filePath);
        expect(output).to.equal(fileContent);
    });
    it('should not change if a relative path is not passed to a require statement', () => {
        let fileContent = 'Some text or code require("~/someLib"); plus some other stuff';
        let output = relativeRequireFileModifier(fileContent, filePath);
        expect(output).to.equal(fileContent);
    });

    it('should change sibling paths', () => {
        let fileContent = 'require("./lib");';
        let output = relativeRequireFileModifier(fileContent, filePath);
        let expectedOutput = 'require("~/some/directory/deep/lib");';
        expect(output).to.equal(expectedOutput);
    });
    it('should change child paths', () => {
        let fileContent = 'require("./child/lib");';
        let output = relativeRequireFileModifier(fileContent, filePath);
        let expectedOutput = 'require("~/some/directory/deep/child/lib");';
        expect(output).to.equal(expectedOutput);
    });
    it('should change parent paths', () => {
        let fileContent = 'require("../lib");';
        let output = relativeRequireFileModifier(fileContent, filePath);
        let expectedOutput = 'require("~/some/directory/lib");';
        expect(output).to.equal(expectedOutput);
    });
    it('should change double paths', () => {
        let fileContent = 'require("./lib"); require("./lib");';
        let output = relativeRequireFileModifier(fileContent, filePath);
        let expectedOutput = 'require("~/some/directory/deep/lib"); require("~/some/directory/deep/lib");';
        expect(output).to.equal(expectedOutput);
    });
    it('should change all relative paths surrounded by other code', () => {
        let fileContent = `
                Some random code;
                require("lib");
                require("./lib");
                require("../otherdirectory/lib");
                require("../lib");
                Some more code;
            `;
        let output = relativeRequireFileModifier(fileContent, filePath);
        let expectedOutput = `
                Some random code;
                require("lib");
                require("~/some/directory/deep/lib");
                require("~/some/directory/otherdirectory/lib");
                require("~/some/directory/lib");
                Some more code;
            `;
        expect(output).to.equal(expectedOutput);
    });
    it('should change all relative paths containing symbols', () => {
        let fileContent = `
                Some random code;
                require("../lib-dir/lib.lib_lib/lib");
                require("./lib-dir/lib.lib_lib/lib");
                Some more code;
            `;
        let output = relativeRequireFileModifier(fileContent, filePath);
        let expectedOutput = `
                Some random code;
                require("~/some/directory/lib-dir/lib.lib_lib/lib");
                require("~/some/directory/deep/lib-dir/lib.lib_lib/lib");
                Some more code;
            `;
        expect(output).to.equal(expectedOutput);
    });
    it('should throw an error if the src file is located outside the app folder', () => {
        let fileContent = 'require("../../../../lib");';
        expect(() => relativeRequireFileModifier(fileContent, filePath)).to.throw('Trying to resolve a path outside the app folder: /home/me/workspace/project/lib');
    });
});
