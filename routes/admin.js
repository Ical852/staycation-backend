const router = require('express').Router()
const adminController = require('../controllers/adminController')
const {upload, uploadMultiple} = require('../middlewares/multer')
const auth = require('../middlewares/auth')

router.get('/signin', adminController.viewSignIn)
router.post('/signin', adminController.actionSignIn)

// router.use(auth)
router.get('/logout', adminController.actionLogout)

router.get('/dashboard', adminController.viewDashboard)

router.get('/category', adminController.viewCategory)
router.post('/category', adminController.adminCategoryAdd)
router.put('/category', adminController.adminCategoryUpdate)
router.delete('/category/:id', adminController.adminCategoryDelete)

router.get('/bank', adminController.viewBank)
router.post('/bank', upload, adminController.adminBankAdd)
router.put('/bank', upload, adminController.adminBankUpdate)
router.delete('/bank/:id', adminController.adminBankDelete)

router.get('/item', adminController.viewItem)
router.post('/item', uploadMultiple, adminController.adminItemAdd)
router.get('/item/show-image/:id', adminController.showImageItem)
router.get('/item/:id', adminController.showEditItem)
router.put('/item/:id', uploadMultiple, adminController.adminItemUpdate)
router.delete('/item/:id', uploadMultiple, adminController.adminItemDelete)

router.get('/item/show-detail-item/:itemId', adminController.viewDetailItem)

router.post('/item/add/feature', upload, adminController.adminFeatureAdd)
router.post('/item/update/feature', upload, adminController.adminFeatureUpdate)
router.delete('/item/:itemId/feature/:id', adminController.adminFeatureDelete)

router.post('/item/add/activity', upload, adminController.adminActivityAdd)
router.post('/item/update/activity', upload, adminController.adminActivityUpdate)
router.delete('/item/:itemId/activity/:id', adminController.adminActivityDelete)

router.get('/booking', adminController.viewBooking)
router.get('/booking/:id', adminController.showDetailBooking)
router.post('/booking/confirm/:id', adminController.actionConfirmation)
router.post('/booking/reject/:id', adminController.actionRejection)
router.post('/booking/process/:id', adminController.actionProcess)

module.exports = router