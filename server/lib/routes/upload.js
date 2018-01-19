const multer = require('multer')
const {uploadDir} = require('../consts')

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, done) => {
    done(null, `${new Date().getTime()}-${file.originalname}`)
  }
})
const upload = multer({ storage })

exports.uploadFile = [
  upload.single('file'),
  (req, res) => {
    res.send({
      file: req.file.filename
    })
  }
]
