# nativescript-angular-unit-tests

This module helps to maintain the angular style guide folder structure for {N} + Angular projects. 

This plugin:
- Watches all generated js spec
- Copies all generated js spec files to a .tmp folder inside app/tests
- Fixes require paths to target original source.
- Runs "tns test [platform]" in parallel.

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

## Karma setup example
```js
{
    ...
    files: [
        'app/tests/config.js',
        'app/tests/.tmp/**/*.js'
    ],
    ...
}
```
```typescript
// app/tests/config.ts
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NS_COMPILER_PROVIDERS } from 'nativescript-angular/platform';
import { TestBed } from '@angular/core/testing';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(NS_COMPILER_PROVIDERS));
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
|   - /tests
|       - /.tmp
|           - /login
|               login.service.spec.js
```
#### Running multiple specs
```
|-- app
|   |-- login
|   |   |-- shared
|   |   |   |-- login.service.ts
|   |   |   |-- login.service.spec.ts
|   |   |-- login.component.css
|   |   |-- login.component.html
|   |   |-- login.component.ts
|   |   |-- login.component.spec.ts
|   |-- app.component.ts
|   |-- app.component.spec.ts
```

```bash
npm run test.android -- --spec=login 
```

```
|-- app
|   |-- tests
|   |   |-- .tmp
|   |   |   |-- login
|   |   |   |   |-- shared
|   |   |   |   |   |-- login.service.spec.js
|   |   |   |   |-- login.component.spec.js
```
