# How To Contribute

This is a fully Open Source project and we will gladly accept PRs and contributions!

We would especially appreciate any help with documentation and any feedback you might have if you have tried out this library. You can reach out to me [on Twitter](https://twitter.com/real_ate) if you would like to get in touch.

## Installation

* Clone this repository
* `npm install`

## Running tests

* `npm run lint:js` - Runs eslint against the codebase (this is configured on Travis)

You need to run [MongoDB](https://www.mongodb.com/) locally to be able to run the tests. If you do not have mongo running locally you can use the `start-docker` and `stop-docker` scripts to manage a local mongo image

* `npm run start-docker` - You only need this if you don't already have MongoDB running locally
* `npm test`
* `npm run stop-docker` - Stops the docker image if you started it
