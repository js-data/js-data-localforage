<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="64" height="64" />

## js-data-localforage [![Slack Status](http://slack.js-data.io/badge.svg)](http://slack.js-data.io) [![npm version](https://img.shields.io/npm/v/js-data-localforage.svg?style=flat)](https://www.npmjs.org/package/js-data-localforage) [![Circle CI](https://img.shields.io/circleci/project/js-data/js-data-localforage/master.svg?style=flat)](https://circleci.com/gh/js-data/js-data-localforage/tree/master) [![npm downloads](https://img.shields.io/npm/dm/js-data-localforage.svg?style=flat)](https://www.npmjs.org/package/js-data-localforage) [![Coverage Status](https://img.shields.io/coveralls/js-data/js-data-localforage/master.svg?style=flat)](https://coveralls.io/github/js-data/js-data-localforage?branch=master)

localforage adapter for [js-data](http://www.js-data.io/).

### API Documentation
[DSLocalForageAdapter](http://www.js-data.io/docs/dslocalforageadapter)

### Demo
[https://js-data-localforage.firebaseapp.com/](https://js-data-localforage.firebaseapp.com/)

### Quick Start
`bower install --save localforage js-data js-data-localforage` or `npm install --save localforage js-data js-data-localforage`.

Load Mozilla's `localforage.nopromises.js`.

Load `js-data-localforage.js` after `js-data.js`.

```js
var adapter = new DSLocalForageAdapter();

var store = new JSData.DS();
store.registerAdapter('lf', adapter, { default: true });

// "store" will now use the localforage adapter for all async operations
```

### Changelog
[CHANGELOG.md](https://github.com/js-data/js-data-localforage/blob/master/CHANGELOG.md)

### Community
- [Slack Channel](http://slack.js-data.io) - Better than IRC!
- [Announcements](http://www.js-data.io/blog)
- [Mailing List](https://groups.io/org/groupsio/jsdata) - Ask your questions!
- [Issues](https://github.com/js-data/js-data-localforage/issues) - Found a bug? Feature request? Submit an issue!
- [GitHub](https://github.com/js-data/js-data-localforage) - View the source code for js-data.
- [Contributing Guide](https://github.com/js-data/js-data-localforage/blob/master/CONTRIBUTING.md)

### Contributing

First, support is handled via the [Slack channel](http://slack.js-data.io) or [Mailing List](https://groups.io/org/groupsio/jsdata). Ask your questions there.

When submitting issues on GitHub, please include as much detail as possible to make debugging quick and easy.

- good - Your versions of js-data, js-data-localforage, localforage, etc, relevant console logs/error, code examples that revealed the issue
- better - A [plnkr](http://plnkr.co/), [fiddle](http://jsfiddle.net/), or [bin](http://jsbin.com/?html,output) that demonstrates the issue
- best - A Pull Request that fixes the issue, including test coverage for the issue and the fix

[Github Issues](https://github.com/js-data/js-data-localforage/issues).

#### Pull Requests

1. Contribute to the issue that is the reason you'll be developing in the first place
1. Fork js-data-localforage
1. `git clone https://github.com/<you>/js-data-localforage.git`
1. `cd js-data-localforage; npm install; bower install;`
1. `grunt go` (builds and starts a watch)
1. (in another terminal) `grunt karma:dev` (runs the tests)
1. Write your code, including relevant documentation and tests
1. Submit a PR and we'll review

### License

The MIT License (MIT)

Copyright (c) 2014-2015 Jason Dobry

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
