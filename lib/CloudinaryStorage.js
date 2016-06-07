var fs = require('fs')
var path = require('path')

function CloudinaryStorage (opts) {
  this.getDestination = opts.getDestination
  this.filename = (opts.filename)

  if (!opts.cloudinary) throw new Error('Cloudinary instance is required in CloudinaryStorage')

  this.cloudinary = opts.cloudinary
}

CloudinaryStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  var self = this;

  var p = this.getDestination()
  var fileName = this.filename(req, file)

  var cloudinaryStream = self.cloudinary.uploader
  .upload_stream(function (result) {
    result.wejsName = fileName;
    cb(null, result)
  }, {
    'public_id': path.join(p, fileName)
  })

  file.stream.pipe(cloudinaryStream)

  cloudinaryStream.on('error', cb)
}

CloudinaryStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  fs.unlink(file.path, cb)
}

module.exports = function (opts) {
  return new CloudinaryStorage(opts)
}