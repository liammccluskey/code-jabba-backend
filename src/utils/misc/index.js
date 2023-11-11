const capitalizeWords = sentence => {
    const words = sentence.split(' ')

    const updatedWords = []
    for (let i = 0; i < words.length; i++) {
        const word = words[i]
        const chars = [...word]

        let updatedWord = ''
        if (chars.length) {
            updatedWord += chars[0].toUpperCase()
            updatedWord += chars.slice(1).join('')
        }

        updatedWords.push(updatedWord)
    }
    return updatedWords.join(' ')
}

const percentDelta = (initialValue, currentValue) => {
    return initialValue ?
        Math.round( (currentValue - initialValue) / initialValue * 100 )
        : currentValue ? 100 : 0
}

module.exports = {
    capitalizeWords,
    percentDelta
}