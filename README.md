<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="64" height="64" />

## js-data-localforage

localStorage adapter for [js-data](http://www.js-data.io/js-data).

## API Documentation
[DSLocalForageAdapter](https://github.com/js-data/js-data/wiki/DSLocalForageAdapter)

## Demo
[https://js-data-localforage.firebaseapp.com/](https://js-data-localforage.firebaseapp.com/)

## Project Status

| Branch | Master |
| ------ | ------ |
| Bower | [![Bower version](https://badge.fury.io/bo/js-data-localforage.png)](http://badge.fury.io/bo/js-data-localforage) |
| NPM | [![NPM version](https://badge.fury.io/js/js-data-localforage.png)](http://badge.fury.io/js/js-data-localforage) |
| Build Status | [![Build Status](https://travis-ci.org/js-data/js-data-localforage.png?branch=master)](https://travis-ci.org/js-data/js-data-localforage) |
| Code Climate | [![Code Climate](https://codeclimate.com/github/js-data/js-data-localforage.png)](https://codeclimate.com/github/js-data/js-data-localforage) |
| Dependency Status | [![Dependency Status](https://gemnasium.com/js-data/js-data-localforage.png)](https://gemnasium.com/js-data/js-data-localforage) |
| Coverage | [![Coverage Status](https://coveralls.io/repos/js-data/js-data-localforage/badge.png?branch=master)](https://coveralls.io/r/js-data/js-data-localforage?branch=master) |

## Quick Start
`bower install --save js-data js-data-localforage` or `npm install --save js-data js-data-localforage`.

Load Mozilla's `localforage.js`.

Load `js-data-localforage.js` after `js-data.js`.

```js
var adapter = new DSLocalForageAdapter();

var store = new JSData.DS();
store.registerAdapter('DSLocalForageAdapter', adapter, { default: true });

// "store" will now use the localforage adapter for all async operations
```

## Changelog
[CHANGELOG.md](https://github.com/js-data/js-data-localforage/blob/master/CHANGELOG.md)

## Community
- [Mailing List](https://groups.io/org/groupsio/jsdata) - Ask your questions!
- [Issues](https://github.com/js-data/js-data-localforage/issues) - Found a bug? Feature request? Submit an issue!
- [GitHub](https://github.com/js-data/js-data-localforage) - View the source code for js-data.
- [Contributing Guide](https://github.com/js-data/js-data-localforage/blob/master/CONTRIBUTING.md)

## Contributing

First, feel free to contact me with questions. [Mailing List](https://groups.io/org/groupsio/jsdata). [Issues](https://github.com/js-data/js-data-localforage/issues).

1. Contribute to the issue that is the reason you'll be developing in the first place
1. Fork js-data-localforage
1. `git clone https://github.com/<you>/js-data-localforage.git`
1. `cd js-data-localforage; npm install; bower install;`
1. `grunt go` (builds and starts a watch)
1. (in another terminal) `grunt karma:dev` (runs the tests)
1. Write your code, including relevant documentation and tests
1. Submit a PR and we'll review

## License

The MIT License (MIT)

Copyright (c) 2014 Jason Dobry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
