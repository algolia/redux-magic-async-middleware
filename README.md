# redux-magic-async-middleware

`redux-magic-async-middleware` is a middleware which makes it easy to handle asynchronous data with redux. Combine it with [redux-updeep] for increased awesomeness and reduced boilerplate !

[![Version][version-svg]][package-url] [![Build Status][travis-svg]][travis-url] [![License][license-image]][license-url]


## Installation

`redux-magic-async-middleware` is available on npm. You'll need [redux-updeep] to take full advantage of it.

```bash
npm install -S redux-magic-async-middleware redux-updeep
```

## Getting started

### 1. Add as a middleware

Just add it as you would add any middleware

```js
import {createStore, applyMiddleware, combineReducers} from 'redux';
import magicAsyncMiddleware from 'redux-magic-async-middleware';

let combinedReducers = combineReducers(...);
let otherMiddlewares = [...];

let store = createStore(
  combinedReducers,
  applyMiddleware(
    magicAsyncMiddleware,
    ...otherMiddlewares
  )
);
```

### 2. Dispatch promises in your action payload as if they were synchronous values

Remember how [redux-updeep] lets you easily dispatch actions and merges the payload automatically in your state ? Well, using `redux-magic-async-middleware` you can do the same with promises. While they are loading, they are represented by [eventual values](https://github.com/algolia/eventual-values), so you can check their status easily. Once they are resolved the data will automatically be updated.

```js
const initialState = {
  user: undefined,
  projectList: undefined
};

export default createReducer('USER', initialState);

export function loadUserData() {
  return {
    type: 'USER/LOAD_USER_DATA',
    payload: {
      user: fetch('/user_data'),
      projectList: fetch('/projectList').then(data => data.projects)
    }
  };
}
```

_Note that the middleware will only look for promises in the first level of the payload. If you need more, use a [path](#using-a-path-to-merge-asynchrounous-data-deeply-in-your-reducer-state)_

### 3. Use the data in your components

```js
import React from 'react';
import {connect} from 'react-redux'
import {isReady} from 'eventual-values';

function MyComponent({user}) {
  if (isReady(user)) {
    return <h1>Hello {user.name}</h1>;
  }

  return <span>Loading</span>;
}

export default connect(({myReducer: {user}}) => ({user}))(MyComponent);
```

## Advanced usage

### Using a path to merge asynchronous data deeply in your reducer state

As mentioned the middleware will only look for promises at the first level in the payload. If the asynchronous data needs to be updated deeper into the reducer state, use a [path](https://github.com/algolia/redux-updeep#specifying-a-path).

```js
const initialState = {
  user: undefined,
  projectList: undefined
};

export default createReducer('USER', initialState);

export function loadName() {
  return {
    type: 'USER/LOAD_NAME',
    payload: {
      name: fetch('/user_name')
    },
    path: ['user']
  };
}
```

### Refreshing data & loading state

By default, the middleware will only mark values as loading if they were `undefined` when the actions were dispatched.

This means that if a key on the reducer's state has a value, and if then a promised is dispatched at this key, then nothing will happen to the reducer state until the promise is resolved or rejected.

It is possible to override this behaviour and reset the value to a loading eventual value at every dispatch by using the overrideStatus key in the action:

```js
const initialState = {
  user: undefined,
  projectList: undefined
};

export default createReducer('USER', initialState);

export function loadUserData() {
  return {
    type: 'USER/LOAD_USER_DATA',
    overrideStatus: true,
    payload: {
      user: fetch('/user_data')
    }
  };
}
```


[version-svg]: https://img.shields.io/npm/v/redux-magic-async-middleware.svg?style=flat-square
[package-url]: https://npmjs.org/package/redux-magic-async-middleware
[travis-svg]: https://img.shields.io/travis/algolia/redux-magic-async-middleware/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/algolia/redux-magic-async-middleware
[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/redux-matic-async-middleware.svg?style=flat-square
[downloads-url]: http://npm-stat.com/charts.html?package=redux-magic-async-middleware
[redux-updeep]: https://github.com/algolia/redux-updeep