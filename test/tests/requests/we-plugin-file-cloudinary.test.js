var assert = require('assert')
var request = require('supertest')
var helpers = require('we-test-tools').helpers
var stubs = require('we-test-tools').stubs
var http
var we
var agent

describe('cloudinaryStorage', function () {
  var salvedFile

  before(function (done) {
    http = helpers.getHttp();
    agent = request.agent(http);

    we = helpers.getWe();

    // upload one stub image:
    request(http)
    .post('/api/v1/file')
    .attach('file', stubs.getImageFilePath())
    .expect(201)
    .end(function (err, res) {
      if (err) {
        console.log('res.text>', res.text)
        throw err;
      }
      salvedFile = res.body.file;
      done(err);
    });
  });

  describe('file', function () {
    it('post /api/v1/file should upload one file', function (done) {

      request(http)
      .post('/api/v1/file')
      .attach('file', stubs.getImageFilePath())
      .expect(201)
      .end(function (err, res) {
        if (err) {
          console.log('res.text>', res.text)
          throw err
        }

        assert(res.body.file)
        assert(res.body.file.urls.original)
        assert(res.body.file.mime)

        done()
      })
    })

    it('get /api/v1/file-download/:name should redirect do cloudinary file', function (done){
      request(http)
      .get('/api/v1/file-download/' + salvedFile.name)
      .expect(302)
      .end(function (err, res) {
        if (err) {
          console.log('res.text>', res.text)
          return done(err)
        }

        assert.equal(res.header.location, salvedFile.urls.original)

        done()
      });
    });

    it('delete /api/v1/file/:name should delete one file', function (done) {
      var salvedFile;

      request(http)
      .post('/api/v1/file')
      .attach('file', stubs.getImageFilePath())
      .expect(201)
      .end(function (err, res) {
        if (err) {
          console.log('res.text>', res.text)
          throw err;
        }
        salvedFile = res.body.file;

        request(http)
        .delete('/api/v1/file/'+salvedFile.name)
        .expect(204)
        .end(function (err, res) {
          if (err) {
            console.log('res.text>', res.text)
            throw err;
          }

          // TODO check if the file exists in cloudinary

          done()
        });
      });
    });
  })

  describe('image', function () {
    it('post /api/v1/image should upload one image', function (done) {
      // upload one stub image:
      request(http)
      .post('/api/v1/image')
      .attach('image', stubs.getImageFilePath())
      .expect(201)
      .end(function (err, res) {
        if (err) {
          console.log('res.text>', res.text)
          return done(err)
        }

        done()
      })
    })

    it('post /api/v1/image should upload one image to cloudinary and redirect to new file', function (done) {
      // upload one stub image:
      request(http)
      .post('/api/v1/image')
      .attach('image', stubs.getImageFilePath())
      .expect(201)
      .end(function (err, res) {
        if (err) {
          console.log('res.text>', res.text)
          return done(err)
        }

        assert(res.body.image.urls.thumbnail)
        assert.equal(res.body.image.urls.thumbnail.indexOf('http://res.cloudinary.com/'), 0)

        done()
      })
    })

    it('delete /api/v1/image/:name should delete one image', function (done) {
      var salvedFile;

      request(http)
      .post('/api/v1/image')
      .attach('image', stubs.getImageFilePath())
      .expect(201)
      .end(function (err, res) {
        if (err) {
          console.log('res.text>', res.text)
          throw err;
        }
        salvedFile = res.body.image;

        request(http)
        .delete('/api/v1/image/'+salvedFile.name)
        .expect(204)
        .end(function (err, res) {
          if (err) {
            console.log('res.text>', res.text)
            throw err;
          }

          // TODO check if the file exists in cloudinary

          done()
        });
      });
    });
  })
});