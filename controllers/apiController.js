const Item = require('../models/Item')
const Treasure = require('../models/Activity')
const Traveler = require('../models/Booking')
const Category = require('../models/Category')
const Bank = require('../models/Bank')
const Member = require('../models/Member')
const Booking = require('../models/Booking')

module.exports = {
    landingPage : async (req, res) => {
        try {
            const mostPicked = await Item.find()
                .select('_id title country city price unit imageId')
                .limit(5)
                .populate({path: 'imageId', select: 'id imageUrl'})

            const traveler = await Traveler.find()
            const treasure = await Treasure.find()
            const city = await Item.find()

            const category = await Category.find()
                .select('_id name')
                .limit(3)
                .populate({
                    path: 'itemId', 
                    select: '_id title country city isPopular imageId',
                    perDocumentLimit: 4,
                    option: { sort: { sumBooking : -1}},
                    populate: {
                        path: 'imageId', 
                        select: 'id imageUrl',
                        perDocumentLimit: 1
                    }
                })
            
            const testimonial = {
                _id: "asd1293uasdads1",
                imageUrl: "images/testimonial.jpg",
                name: "Happy Family",
                rate: 4.55,
                content: "What a great trip with my family and I should try again next time soon ...",
                familyName: "Ical",
                familyOccupation: "Software Engineer"
            }
            
            for (let i = 0; i < category.length; i++) {
                for (let x = 0; x < category[i].itemId.length; x++) {
                    const item = await Item.findOne({
                        _id: category[i].itemId[x]._id
                    });
                    item.isPopular = false;
                    await item.save();
                    if (category[i].itemId[0] === category[i].itemId[x]) {
                        item.isPopular = true;
                        await item.save();
                    }
                }
            }

            res.status(200).json({
                hero: {
                    travelers: traveler.length,
                    treasures: treasure.length,
                    cities: city.length
                },
                mostPicked,
                categories: category,
                testimonial: testimonial
            })
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    },

    detailPage: async (req, res) => {
        try {
            const {id} = req.params
            const item = await Item.findOne({_id: id})
                .populate({path: 'featureId', select: '_id name qty imageUrl'})
                .populate({path: 'activityId', select: '_id name type imageUrl'})
                .populate({path: 'imageId', select: '_id imageUrl'})

            const testimonial = {
                _id: "asd1293uasdads1",
                imageUrl: "/images/testifamily.jpg",
                name: "Happy Family",
                rate: 4.25,
                content: "What a great trip with my family and I should try again and again next time soon...",
                familyName: "Ical",
                familyOccupation: "Fullstack Developer"
            }

            const bank = await Bank.find()

            res.status(200).json({
                ...item._doc,
                testimonial,
                bank
            })
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    },

    booking: async (req, res) => {
        try {
            const bookingRequest = {
                idItem,
                duration,
                // price,
                bookingStartDate,
                bookingEndDate,
                firstName,
                lastName,
                emailAddress,
                phoneNumber,
                accountHolder,
                bankFrom,
            } = req.body

            if(!req.file) {
                return res.status(404).json({message: 'Image not found'})
            }

            if (idItem === undefined || idItem === "" ||
                duration === undefined || duration === "" ||
                // price === undefined ||
                bookingStartDate === undefined || bookingStartDate === "" ||
                bookingEndDate === undefined || bookingEndDate === "" ||
                firstName === undefined || firstName === "" ||
                lastName === undefined || lastName === "" ||
                emailAddress === undefined || emailAddress === "" ||
                phoneNumber === undefined || phoneNumber === "" ||
                accountHolder === undefined || accountHolder === "" ||
                bankFrom === undefined || bankFrom === "") {
                return res.status(404).json({message: 'Complete your form !'})
            }

            const item = await Item.findOne({_id: idItem})

            if (!item) {
                return res.status(404).json({message: 'Item Not Found'})
            }

            item.sumBooking += 1

            await item.save()

            let total = item.price * duration
            let tax = total * 0.10

            const invoice = Math.floor(1000000 + Math.random() * 9000000)

            const member = await Member.create({
                firstName: firstName,
                lastName: lastName,
                email: emailAddress,
                phoneNumber: phoneNumber
            })

            const newBooking = {
                invoice,
                bookingStartDate,
                bookingEndDate,
                total: total += tax,
                itemId: {
                    _id: item.id,
                    title: item.title,
                    price: item.price,
                    duration: duration
                },
                memberId: member.id,
                payments: {
                    proofPayment: `images/${req.file.filename}`,
                    bankFrom: bankFrom,
                    accountHolder: accountHolder,
                }
            }

            const booking = await Booking.create(newBooking)

            res.status(201).json({message: 'Success Booking', booking})
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: `${error}` });
        }
    }
}