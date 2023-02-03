const Category = require('../models/Category')
const Bank = require('../models/Bank')
const Item = require('../models/Item')
const Image = require('../models/Image')
const Feature = require('../models/Feature')
const Activity = require('../models/Activity')
const Users = require('../models/Users')
const Booking = require('../models/Booking')
const Member = require('../models/Member')

const fs = require('fs-extra')
const path = require('path')
const bcrypt = require('bcryptjs')

module.exports = {
    viewSignIn: async (req, res) => {
        try {
            const alertMessage = req.flash('alertMessage')
            const alertStatus = req.flash('alertStatus')
            const alert = {message: alertMessage, status: alertStatus}
            
            if (req.session.user == null || req.session.user == undefined) {
                res.render('index', {
                    req: req,
                    alert: alert,
                    title: 'Staycation - Login'
                })
            } else {
                res.redirect('/admin/dashboard')
            }

        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/signin')
        }
    },

    actionSignIn: async (req, res) => {
        try {
            const { username, password } = req.body
            const user = await Users.findOne({
                username: username,
            })

            if(!user) {
                req.flash('alertMessage', 'User not found')
                req.flash('alertStatus', 'danger')

                return res.redirect('/admin/signin')
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password)

            if (!isPasswordMatch) {
                req.flash('alertMessage', 'Wrong Password')
                req.flash('alertStatus', 'danger')

                return res.redirect('/admin/signin')
            }

            req.session.user = {
                id: user.id,
                username: user.username,
                password: user.password
            }

            res.redirect('/admin/dashboard')
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/signin')
        }
    },

    actionLogout: async (req, res) => {
        req.flash('alertMessage', `logout success`)
        req.flash('alertStatus', 'success')

        req.session.destroy()
        res.redirect('/admin/signin')
    },

    viewDashboard: async (req, res) => {
        try {
            const member = await Member.find()
            const booking = await Booking.find()
            const item = await Item.find()
            
            res.render('admin/dashboard/view_dashboard', {
                req: req,
                title: 'Staycation - Dashboard',
                member: member,
                booking: booking,
                item: item
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/dashboard')
        }
    },

    viewCategory : async (req, res) => {
        try {
            const category = await Category.find()

            const alertMessage = req.flash('alertMessage')
            const alertStatus = req.flash('alertStatus')
            const alert = {message: alertMessage, status: alertStatus}

            res.render('admin/category/view_category', {
                req: req,
                category: category,
                alert: alert,
                title: 'Staycation - Category'
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/category')
        }
    },
    
    adminCategoryAdd: async (req, res) => {
        try {
            const {name} = req.body
            await Category.create({ name })

            req.flash('alertMessage', 'Success Add Category')
            req.flash('alertStatus', 'success')

            res.redirect('/admin/category')
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/category')
        }
    },

    adminCategoryUpdate: async (req, res) => {
        try {
            const {id, name} = req.body
            const category = await Category.findOne({_id:id})
            if (category) {
                category.name = name
                await category.save()
            }

            req.flash('alertMessage', 'Success Update Category')
            req.flash('alertStatus', 'success')

            res.redirect('/admin/category')
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/category')
        }
    },

    adminCategoryDelete: async (req, res) => {
        try {
            const { id } = req.params
            const category = await Category.findOne({_id:id})
            if (category) {
                await category.remove()
            }

            req.flash('alertMessage', 'Success Delete Category')
            req.flash('alertStatus', 'success')

            res.redirect('/admin/category')
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/category')
        }
    },

    viewBank: async (req, res) => {
        try {
            const bank = await Bank.find()

            const alertMessage = req.flash('alertMessage')
            const alertStatus = req.flash('alertStatus')
            const alert = {message: alertMessage, status: alertStatus}

            res.render('admin/bank/view_bank', {
                req: req,
                bank: bank,
                alert: alert,
                title: 'Staycation - Bank'
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/bank')
        }
    },

    adminBankAdd: async (req, res) => {
        try {
            const { bank_name, no_rek, name } = req.body
            await Bank.create({
                nameBank: bank_name,
                nomorRekening: no_rek,
                name,
                imageUrl: `images/${req.file.filename}`
            })

            req.flash('alertMessage', 'Success Add Bank')
            req.flash('alertStatus', 'success')

            res.redirect('/admin/bank')
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/bank')
        }
    },

    adminBankUpdate: async (req, res) => {
        try {
            const { bank_name, no_rek, name, id } = req.body
            const bank = await Bank.findOne({_id:id})
            if (bank) {
                bank.name = name
                bank.nameBank = bank_name
                bank.nomorRekening = no_rek
                if (req.file) {
                    await fs.unlink(path.join(`public/${bank.imageUrl}`))
                    bank.imageUrl = `images/${req.file.filename}`
                }
                await bank.save()
            }

            req.flash('alertMessage', 'Success Update Bank')
            req.flash('alertStatus', 'success')

            res.redirect('/admin/bank')
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/bank')
        }
    },

    adminBankDelete: async (req, res) => {
        try {
            const { id } = req.params
            const bank = await Bank.findOne({_id:id})
            if (bank) {
                await fs.unlink(path.join(`public/${bank.imageUrl}`))
                await bank.remove()
            }

            req.flash('alertMessage', 'Success Delete Bank')
            req.flash('alertStatus', 'success')

            res.redirect('/admin/bank')
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/bank')
        }
    },

    viewItem: async (req, res) => {
        try {
            const category = await Category.find()
            const item = await Item.find()
                .populate({path: 'imageId', select: 'id imageUrl'})
                .populate({path: 'categoryId', select: 'id name'})

            const alertMessage = req.flash('alertMessage')
            const alertStatus = req.flash('alertStatus')
            const alert = {message: alertMessage, status: alertStatus}

            res.render('admin/item/view_item', {
                req: req,
                title: 'Staycation - Item',
                category: category,
                alert: alert,
                item: item,
                action: 'view'
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/item')
        }
    },

    adminItemAdd: async (req, res) => {
        try {
            const { categoryId, title, price, city, about } = req.body
            if (req.files.length > 0) {
                const category = await Category.findOne({_id:categoryId})
                const newItem = {
                    categoryId,
                    title,
                    description: about,
                    price,
                    city
                }
                const item = await Item.create(newItem)
                category.itemId.push({_id: item._id})
                await category.save()
                for(let i=0; i < req.files.length; i++) {
                    const imageSave = await Image.create({imageUrl: `images/${req.files[i].filename}`})
                    item.imageId.push({_id: imageSave._id})
                    await item.save()
                }
            }
            req.flash('alertMessage', 'Success Add Item')
            req.flash('alertStatus', 'success')

            res.redirect('/admin/item')
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/item')
        }
    },

    showImageItem: async (req, res) => {
        try {
            const {id} = req.params
            const item = await Item.findOne({_id:id})
                .populate({path: 'imageId', select: 'id imageUrl'})

            const alertMessage = req.flash('alertMessage')
            const alertStatus = req.flash('alertStatus')
            const alert = {message: alertMessage, status: alertStatus}

            res.render('admin/item/view_item', {
                req: req,
                title: 'Staycation - Show Image Item',
                alert: alert,
                item: item,
                action : 'showimage'
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/item')
        }
    },

    showEditItem: async (req, res) => {
        try {
            const category = await Category.find()
            const {id} = req.params
            const item = await Item.findOne({_id:id})
                .populate({path: 'imageId', select: 'id imageUrl'})
                .populate({path: 'categoryId', select: 'id name'})

            const alertMessage = req.flash('alertMessage')
            const alertStatus = req.flash('alertStatus')
            const alert = {message: alertMessage, status: alertStatus}

            res.render('admin/item/view_item', {
                req: req,
                title: 'Staycation - Edit Item',
                alert: alert,
                item: item,
                category: category,
                action : 'edit'
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/item')
        }
    },

    adminItemUpdate: async (req, res) => {
        try {
            const {id} = req.params
            const { categoryId, title, price, city, about } = req.body

            const item = await Item.findOne({_id:id})
                .populate({path: 'imageId', select: 'id imageUrl'})
                .populate({path: 'categoryId', select: 'id name'})
            
            if (req.files.length > 0) {
                for(let i = 0; i < item.imageId.length; i++) {
                    const imageUpdate = await Image.findOne({_id: item.imageId[i]._id})
                    await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`))
                    await imageUpdate.remove()
                }
                for(let i=0; i < req.files.length; i++) {
                    const imageSave = await Image.create({imageUrl: `images/${req.files[i].filename}`})
                    await imageSave.save()
                    item.imageId[i] = imageSave
                }
            } 

            item.title = title
            item.price = price
            item.city = city
            item.description = about,
            item.categoryId = categoryId

            await item.save()

            req.flash('alertMessage', 'Success Update Item')
            req.flash('alertStatus', 'success')
            
            res.redirect('/admin/item')
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/item')
        }
    },

    adminItemDelete: async (req, res) => {
        try {
            const {id} = req.params
            const item = await Item.findOne({_id:id}).populate('imageId')

            for(let i = 0; i < item.imageId.length; i++) {
                Image.findOne({_id: item.imageId[i]._id}).then(image => {
                    fs.unlink(path.join(`public/${image.imageUrl}`))
                    image.remove()
                }).catch( error => {
                    req.flash('alertMessage', `${error.message}`)
                    req.flash('alertStatus', 'danger')

                    res.redirect('/admin/item')
                })
            }

            await item.remove()

            req.flash('alertMessage', 'Success Delete Item')
            req.flash('alertStatus', 'success')

            res.redirect('/admin/item')
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect('/admin/item')
        }
    },

    viewDetailItem: async (req, res) => {
        const {itemId} = req.params
        try {

            const feature = await Feature.find({
                itemId: itemId
            })

            const activity = await Activity.find({
                itemId: itemId
            })

            const alertMessage = req.flash('alertMessage')
            const alertStatus = req.flash('alertStatus')
            const alert = {message: alertMessage, status: alertStatus}

            res.render('admin/item/detail_item/view_detail_item', {
                title: 'Staycation - Detail Item',
                req,
                alert,
                itemId,
                feature,
                activity
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        }
    },

    adminFeatureAdd: async (req, res) => {
        try {
            const { name, qty, itemId } = req.body

            if (!req.file) {
                req.flash('alertMessage', 'Upload At Least 1 File')
                req.flash('alertStatus', 'danger')

                res.redirect(`/admin/item/show-detail-item/${itemId}`)
            }

            const feature = await Feature.create({
                name: name,
                qty: qty,
                imageUrl: `images/${req.file.filename}`,
                itemId
            })

            const item = await Item.findOne({_id: itemId})
            item.featureId.push({_id: feature._id})
            await item.save()

            req.flash('alertMessage', 'Success Add Feature')
            req.flash('alertStatus', 'success')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        }
    },

    adminFeatureUpdate: async (req, res) => {
        try {
            const { name, qty, id, itemId } = req.body
            const feature = await Feature.findOne({_id:id})
            if (feature) {
                feature.name = name
                feature.qty = qty
                if (req.file) {
                    await fs.unlink(path.join(`public/${feature.imageUrl}`))
                    feature.imageUrl = `images/${req.file.filename}`
                }
                await feature.save()
            }

            req.flash('alertMessage', 'Success Update Feature')
            req.flash('alertStatus', 'success')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        }
    },

    adminFeatureDelete: async (req, res) => {
        const { id, itemId } = req.params
        try {
            const feature = await Feature.findOne({_id:id})
            const item = await Item.findOne({_id: itemId}).populate('featureId')

            if (feature) {
                item.featureId.pull({_id: feature._id})
                await item.save()

                await fs.unlink(path.join(`public/${feature.imageUrl}`))
                await feature.remove()
            }

            req.flash('alertMessage', 'Success Delete Feature')
            req.flash('alertStatus', 'success')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        }
    },

    adminActivityAdd: async (req, res) => {
        try {
            const { name, type, itemId } = req.body

            if (!req.file) {
                req.flash('alertMessage', 'Upload At Least 1 File')
                req.flash('alertStatus', 'danger')

                res.redirect(`/admin/item/show-detail-item/${itemId}`)
            }

            const activity = await Activity.create({
                name: name,
                type: type,
                imageUrl: `images/${req.file.filename}`,
                itemId
            })

            const item = await Item.findOne({_id: itemId})
            item.activityId.push({_id: activity._id})
            await item.save()

            req.flash('alertMessage', 'Success Add Activity')
            req.flash('alertStatus', 'success')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        }
    },

    adminActivityUpdate: async (req, res) => {
        const { name, type, id, itemId } = req.body
        try {
            const activity = await Activity.findOne({_id:id})
            if (activity) {
                activity.name = name
                activity.type = type
                if (req.file) {
                    await fs.unlink(path.join(`public/${activity.imageUrl}`))
                    activity.imageUrl = `images/${req.file.filename}`
                }
                await activity.save()
            }

            req.flash('alertMessage', 'Success Update Activity')
            req.flash('alertStatus', 'success')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        }
    },

    adminActivityDelete: async (req, res) => {
        const { id, itemId } = req.params
        try {
            const activity = await Activity.findOne({_id:id})
            const item = await Item.findOne({_id: itemId}).populate('activityId')

            if (activity) {
                item.activityId.pull({_id: activity._id})
                await item.save()

                await fs.unlink(path.join(`public/${activity.imageUrl}`))
                await activity.remove()
            }

            req.flash('alertMessage', 'Success Delete Activity')
            req.flash('alertStatus', 'success')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect(`/admin/item/show-detail-item/${itemId}`)
        }
    },

    viewBooking: async (req, res) => {
        try {
            const booking = await Booking.find()
                .populate('memberId')
                .populate('bankId');
            res.render('admin/booking/view_booking', {
                req: req,
                title: 'Staycation - Booking',
                booking: booking,
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect(`/admin/booking`)
        }
    },

    showDetailBooking: async(req, res) => {
        const {id} = req.params
        try {
            const alertMessage = req.flash('alertMessage')
            const alertStatus = req.flash('alertStatus')
            const alert = {message: alertMessage, status: alertStatus}

            const booking = await Booking.findOne({_id: id})
                .populate('memberId')
                .populate('bankId')

            res.render('admin/booking/show_detail_booking', {
                req: req,
                title: 'Staycation - Detail Booking',
                booking: booking,
                alert: alert
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect(`/admin/booking`)
        }
    },

    actionConfirmation: async(req, res) => {
        const {id} = req.params
        try {
            const booking = await Booking.findOne({_id: id})
            booking.payments.status = 'Accept'
            booking.save()

            req.flash('alertMessage', 'Confirmation Success')
            req.flash('alertStatus', 'success')

            res.redirect(`/admin/booking/${id}`)
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect(`/admin/booking/${id}`)
        }
    },

    actionRejection: async(req, res) => {
        const {id} = req.params
        try {
            const booking = await Booking.findOne({_id: id})
            booking.payments.status = 'Reject'
            booking.save()

            req.flash('alertMessage', 'Rejection Success')
            req.flash('alertStatus', 'success')

            res.redirect(`/admin/booking/${id}`)
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect(`/admin/booking/${id}`)
        }
    },

    actionProcess: async(req, res) => {
        const {id} = req.params
        try {
            const booking = await Booking.findOne({_id: id})
            booking.payments.status = 'Proses'
            booking.save()

            req.flash('alertMessage', 'Back to Process Success')
            req.flash('alertStatus', 'success')

            res.redirect(`/admin/booking/${id}`)
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')

            res.redirect(`/admin/booking/${id}`)
        }
    }
}