const MsList = Object.freeze({
    noDescription: "noDescription",
    noStarValue: "noStarValue",
    noLandInfo: "noLandInfo",
})

const languageTranslations = {
    "ar": {
        [MsList.noDescription]: "No Description but in arabic",
        [MsList.noStarValue]: "",
        [MsList.noLandInfo]: "",
    },
    "en": {
        [MsList.noDescription]: "No description found, please add some description",
        [MsList.noStarValue]: "Please add stars out of 5",
        [MsList.noLandInfo]: "Unable to find land information",
    }
}

function msTrans(value, language = "en") {
    if (!languageTranslations[language]) {
        language = "en"
    }
    if (!MsList[value]) {
        return ""
    }

    return languageTranslations[language][MsList[value]] || ""
}

module.exports = { MsList, msTrans }