# we-plugin-file-cloudinary :cloud:

[Cloudinary](http://cloudinary.com) file storage plugin for [We.js](https://wejs.org/), upload files to Cloudinary and save metadata in file or image model

Suport for resize images based in image styles configuration

## Installation

```sh
npm i --save we-plugin-file-cloudinary
```

## Configuration

Create one account in http://cloudinary.com

And add account configuration and change default storage in **config/local.js** file:

```js
  // ----
  apiKeys: {
    cloudinary: {
      'cloud_name': 'clowdname',
      'api_key': 'apikey',
      'api_secret': 'apisecret'
    }
  },
  // change default image and file storage to cloudinary:
  upload: {
    defaultImageStorage: 'cloudinary',
    defaultFileStorage: 'cloudinary'
  }
  // ----
```

## Links

* We.js site: http://wejs.org
* Cloundnary: http://cloudinary.com

#### NPM Info:
[![NPM](https://nodei.co/npm/we-plugin-file.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/we-plugin-file/)


## Copyright and license

Under [the MIT license](https://github.com/wejs/we-core/blob/master/LICENSE.md).# we-plugin-file-cloudinary
