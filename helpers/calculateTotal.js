const calculateSubtotal = (cart) => {
    let subtotal = 0;
    for (const cartItem of cart) {
        const isDiscounted = cartItem.product.discountStatus &&
            new Date(cartItem.product.discountStart) <= new Date() &&
            new Date(cartItem.product.discountEnd) >= new Date();

        const priceToConsider = cartItem.product.discountPrice;

        subtotal += priceToConsider * cartItem.quantity;
    }
    return subtotal;
};

function calculateDiscountedTotal(total, discountPercentage) {
    if (discountPercentage < 0 || discountPercentage > 100) {
        throw new Error('Discount percentage must be between 0 and 100.');
    }

    const discountAmount = (discountPercentage / 100) * total;
    const discountedTotal = total - discountAmount;

    return discountedTotal;
};

// ! product total
const calculateProductTotal = (cart) => {
    let productTotals = 0;
    for (const cartItem of cart) {
        const total = cartItem.product.discountPrice * cartItem.quantity;
        productTotals += total
    }
    return productTotals;
};


module.exports = {
    calculateSubtotal,
    calculateDiscountedTotal,
    calculateProductTotal,
}