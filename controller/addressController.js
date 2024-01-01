// **REQUIRES / IMPORTS
const address = require('../model/addressModel')


// ! load address page
const loadAdressPage = async (req, res) => {
    try {
        const user = req.session.userId
        res.render('addAddress', { user })
    } catch (error) {
        console.log(error.message)
    }
}

// ! Add address
const addAddress = async (req, res) => {
    try {
        const userId = req.session.userId;

        const newAddress = new address({
            user: userId,
            type: req.body.type,
            phone: req.body.phone,
            houseName: req.body.houseName,
            name: req.body.name,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,

        });

        await newAddress.save();

        if (req.query.checkout) {
            res.redirect('/checkoutPage');
        } else {
            res.redirect('/profile');
        }

    } catch (error) {
        console.log(error.message);
    }
};

// ! Delete Address
const deleteAddress = async (req, res) => {
    try {
        const addressId = req.query.addressId
        await address.deleteOne({ _id: addressId })
        res.redirect('/profile');
    } catch (error) {
        console.log(error.message)
    }
}

// ! Load edit address
const editAddress = async (req, res) => {
    try {
        const user = req.session.userId
        const addressId = req.query.addressId;
        const addressData = await address.findById(addressId);
        res.render('editAddress', { user, addressData });
    } catch (error) {
        console.log(error.message)
    }
}

// ! insert edit address
const insertEditAddress = async (req, res) => {
    try {
        const userId = req.session.userId
        const addressId = req.body.addressId;
        const addressData = await address.findById(addressId);
        if (req.body.type) {
            addressData.type = req.body.type
        }
        if (req.body.phone) {
            addressData.phone = req.body.phone
        }
        if (req.body.houseName) {
            addressData.houseName = req.body.houseName
        }
        if (req.body.name) {
            addressData.name = req.body.name
        }
        if (req.body.street) {
            addressData.street = req.body.street
        }
        if (req.body.city) {
            addressData.city = req.body.city
        }
        if (req.body.state) {
            addressData.state = req.body.state
        }
        if (req.body.pincode) {
            addressData.pincode = req.body.pincode
        }

        
        await addressData.save();

        res.redirect('/profile');

    } catch (error) {
        console.log(error.message)
    }
}

// ! Set Default Address 
const setDefaultAddress = async (req, res) => {
    try {
        
      const addressId = req.query.id;
      await address.updateMany({}, { $set: { isDefault: false } });
      const updatedAddress = await address.findByIdAndUpdate(
        addressId,
        { $set: { isDefault: true } },
        { new: true }
      );
      res.status(200).json({ success: true, message: 'Set address as default' });
        } catch (error) {
      console.error("Error setting default address:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

module.exports = {
    loadAdressPage,
    addAddress,
    deleteAddress,
    editAddress,
    insertEditAddress,
    setDefaultAddress
    
}