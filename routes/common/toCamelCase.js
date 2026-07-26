module.exports = function (input) {
    let words = input.split(/(?=[A-Z])/);
    return words.map((word, index) => index === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase()).join('');
}