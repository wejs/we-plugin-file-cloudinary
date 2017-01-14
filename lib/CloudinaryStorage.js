const fs = require('fs'),
  path = require('path');

function CloudinaryStorage (opts) {
  this.getDestination = opts.getDestination;
  this.filename = (opts.filename);

  if (!opts.cloudinary) {
    throw new Error('Cloudinary instance is required in CloudinaryStorage');
  }

  this.cloudinary = opts.cloudinary;
}

CloudinaryStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  const self = this,
    p = this.getDestination(),
    fileName = this.filename(req, file);

  const cloudinaryStream = self.cloudinary.uploader
  .upload_stream( (result)=> {
    result.wejsName = fileName;
    cb(null, result);
  }, {
    'public_id': path.join(p, fileName)
  });

  file.stream.pipe(cloudinaryStream);

  cloudinaryStream.on('error', cb);
};

CloudinaryStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  fs.unlink(file.path, cb);
};

module.exports = function innit(opts) {
  return new CloudinaryStorage(opts);
};