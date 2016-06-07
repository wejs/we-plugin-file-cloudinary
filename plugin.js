/**
 * Plugin.js file, set configs, routes, hooks and events here
 *
 * see http://wejs.org/docs/we/plugin
 */

var uuid = require('uuid')
var path = require('path')
var cloudinaryStorage = require('./lib/CloudinaryStorage')
var cloudinary = require('cloudinary')

module.exports = function loadPlugin (projectPath, Plugin) {
  var plugin = new Plugin(__dirname)

  plugin.cloudinary = cloudinary

  // set plugin configs
  plugin.setConfigs({
    upload: {
      storages: {
        cloudinary: {
          isLocalStorage: false,
          getStorage: function getStorage(we) {
            if (!we.config.apiKeys.cloudinary) {
              console.log('configure your cloudinary api keys in: we.config.apiKeys.cloudinary')
              we.exit(function(){ process.exit() })
            }

            cloudinary.config({
              cloud_name: we.config.apiKeys.cloudinary.cloud_name,
              api_key: we.config.apiKeys.cloudinary.api_key,
              api_secret: we.config.apiKeys.cloudinary.api_secret
            })

            return cloudinaryStorage({
              cloudinary: cloudinary,
              getDestination: this.getDestination,
              filename: this.filename
            })
          },
          /**
           * Send one file to user
           *
           * @param  {Object} file
           * @param  {Object} req
           * @param  {Object} res
           * @param  {String} style
           */
          sendFile: function sendFile (file, req, res, style) {
            if (!style) style = 'original'
            // send to cloudinary file
            res.redirect( ( file.urls[style] || file.urls.original) )
          },
          destroyFile: function destroyFile (file, done) {
            cloudinary.uploader
            .destroy(file.extraData.public_id, function (result) {

              if (result.result != 'ok') {
                plugin.we.log.error('error on delete image from cloudinary:', result)
              }

              done()
            })
          },
          getUrlFromFile: function (format, file) {
            if (!file.extraData) file.extraData = {
              public_id: file.public_id
            }

            file.name = file.wejsName
            file.size = file.bytes
            file.extension = '.'+file.format

            return file.secure_url
          },
          getDestination: function getDestination (style) {
            if (!style) style = 'original'
            return 'wejs-uploads/'+style
          },
          getPath: function getPath (style, name) {
            return path.join(
              this.getDestination(style),
              name
            )
          },
          /**
           * Make unique file name
           *
           * @param  {Object} req
           * @param  {Object} file
           * @return {String}      new file name
           */
          filename: function filename () {
            return Date.now() + '_' + uuid.v1()
          },

          generateImageStyles: function generateImageStyles (file, done) {
            var we = plugin.we
            var styles = we.config.upload.image.avaibleStyles

            for (var i = 0; i < styles.length; i++) {
              this.resizeEach(styles[i], file, this)
            }

            done()
          },
          /**
           * Resize one image to fit image style size
           *
           * @param  {String}   imageStyle
           * @param  {Object}   file
           * @param  {Object}   uploader
           * @param  {Function} next         callback
           */
          resizeEach: function resizeEach (imageStyle, file) {
            var style = plugin.we.config.upload.image.styles[imageStyle]

            file.urls[imageStyle] = cloudinary
            .url(file.extraData.public_id, {
              width: style.width,
              height: style.width,
              crop: 'fit'
            })
          }
        }
      }
    }
  });

  return plugin;
};
