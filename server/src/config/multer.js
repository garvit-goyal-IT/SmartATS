import multer from 'multer'
import path from 'path'

const storage= multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'))
    },
    filename: (req, file, cb) => {
        const unique= Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, unique + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype=== "application/pdf"){
        cb(null, true)
    }else{
        cb(new Error('Only PDF files are allowed'), false)
    }
}

export const upload = multer({ storage, fileFilter, limits:{fileSize :5 * 1024 * 1024} })