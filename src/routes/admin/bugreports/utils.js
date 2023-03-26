const percentDelta = (initialValue, currentValue) => {
    return initialValue ?
        Math.round( (currentValue - initialValue) / initialValue * 100 )
        : currentValue ? 100 : 0
}

module.exports = {
    percentDelta
}