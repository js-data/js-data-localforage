# Contributing Guide

First, support is handled via the [Mailing List](https://groups.io/org/groupsio/jsdata). Ask your questions there.

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
