/**
 * Main We.js Clowndinary file storage plugin
 *
 * see http://wejs.org/docs/we/plugin
 */

const uuid = require('uuid'),
  path = require('path'),
  cloudinaryStorage = require('./lib/CloudinaryStorage'),
  cloudinary = require('cloudinary');

module.exports = function loadPlugin (projectPath, Plugin) {
  const plugin = new Plugin(__dirname);

  plugin.cloudinary = cloudinary;

  // set plugin configs
  plugin.setConfigs({
    upload: {
      storages: {
        cloudinary: {
          isLocalStorage: false,
          getStorage(we) {
            if (!we.config.apiKeys.cloudinary) {
              console.log('configure your cloudinary api keys in: we.config.apiKeys.cloudinary');
              we.exit(function(){ process.exit(); });
            }

            cloudinary.config({
              cloud_name: we.config.apiKeys.cloudinary.cloud_name,
              api_key: we.config.apiKeys.cloudinary.api_key,
              api_secret: we.config.apiKeys.cloudinary.api_secret
            });

            return cloudinaryStorage({
              cloudinary: cloudinary,
              getDestination: this.getDestination,
              filename: this.filename
            });
          },
          /**
           * Send one file to user
           *
           * @param  {Object} file
           * @param  {Object} req
           * @param  {Object} res
           * @param  {String} style
           */
          sendFile(file, req, res, style) {
            if (!style) style = 'original';
            // send to cloudinary file
            res.redirect( ( file.urls[style] || file.urls.original) );
          },
          destroyFile(file, done) {
            cloudinary.uploader
            .destroy(file.extraData.public_id, (result)=> {

              if (result.result != 'ok') {
                plugin.we.log.error('error on delete image from cloudinary:', result);
              }

              return done();
            });
          },
          getUrlFromFile(format, file) {
            if (!file.extraData) file.extraData = {
              public_id: file.public_id
            };

            file.name = file.wejsName;
            file.size = file.bytes;
            file.extension = '.'+file.format;

            return file.secure_url;
          },
          getDestination(style) {
            if (!style) style = 'original';
            return 'wejs-uploads/'+style;
          },
          getPath(style, name) {
            return path.join(
              this.getDestination(style),
              name
            );
          },

          /**
           * Make unique file name
           *
           * @param  {Object} req
           * @param  {Object} file
           * @return {String}      new file name
           */
          filename() {
            return Date.now() + '_' + uuid.v1();
          },

          generateImageStyles(file, done) {
            const we = plugin.we,
              styles = we.config.upload.image.avaibleStyles;

            for (let i = 0; i < styles.length; i++) {
              this.resizeEach(styles[i], file, this);
            }

            done();
          },

          /**
           * Resize one image to fit image style size
           *
           * @param  {String}   imageStyle
           * @param  {Object}   file
           * @param  {Object}   uploader
           * @param  {Function} next         callback
           */
          resizeEach(imageStyle, file) {
            const style = plugin.we.config.upload.image.styles[imageStyle];

            file.urls[imageStyle] = cloudinary
            .url(file.extraData.public_id, {
              width: style.width,
              height: style.width,
              crop: 'fit'
            });
          }
        }
      }
    }
  });

  /**
   * Plugin fast loader
   *
   * Defined for faster project bootstrap
   *
   * @param  {Object}   we
   * @param  {Function} done callback
   */
  plugin.fastLoader = function fastLoader(we, done) {
    done();
  };

  return plugin;
};
