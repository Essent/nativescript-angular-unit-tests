# nativescript-angular-unit-tests

NativeScript currently only supports test files in the app/tests folder. This module helps maintaining the angular style guide folder structure for {N} + Angular projects by watching the spec files and running the tns test command.

## Install
```bash
npm i --save-dev nativescript-angular-unit-tests
```
Add a script to your project's package.json and call 'tns-test-angular'.
```json
{
  "scripts": {
    "test.android": "tns-test-angular --platform=android",
    "test.ios": "tns-test-angular --platform=ios"
  }
}
```

## Flags
#### Running a specific spec
```
|- /app
|   - /login
|       _ login.component.ts
|       _ login.component.spec.ts
|       - login.service.ts
|       - login.servic.spec.ts
|   - app.component.ts
|   - app.component.spec.ts
```

```bash
npm run test.android -- --spec=login.service 
```

```
|- /app
|   - test
|       - .tmp
|           - /login
|               login.service.spec
```
#### Running multiple specs
```
|- /app
|   - /login
|       _ login.component.ts
|       _ login.component.spec.ts
|       - login.service.ts
|       - login.servic.spec.ts
|   - app.component.ts
|   - app.component.spec.ts
```

```bash
npm run test.android -- --spec=service 
```

```
|- /app
|   - test
|       - .tmp
|           - /login
|               - login.component.spec.ts
|               - login.service.spec.ts
```

## Karma setup example
```typescript
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NS_COMPILER_PROVIDERS } from 'nativescript-angular/platform';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { TestBed } from '@angular/core/testing';

/**
 * 1.5.1 Fix
 */
import { NativeScriptDomAdapter } from 'nativescript-angular/dom-adapter';
NativeScriptDomAdapter.prototype.setGlobalVar = function (_name, _value) { };

chai.use(sinonChai);
chai.config.truncateThreshold = 0;

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(NS_COMPILER_PROVIDERS));
```