const reply = require("../routes/common/reply");
const { tableLkpActivities, tableLkpActivitiesRum,
    tableAttractions, tablePreviewAttractions,
    tableRumCamps, tableRumDrones, tableRumRoutes,
    tableRumArchaeological, tableRumAttractions, tableRumMountain,
    tableLkpActivitiesCategories
} = require("./dbTables");
const ref = require("./ref");

const appLocation = Object.freeze({
    aqaba: {
        id: "aqaba",
        activity: {
            url: tableLkpActivities,
            dbRef: ref.lkpActivity
        },
        activityCategory: {
            url: tableLkpActivitiesCategories,
            dbRef: ref.translationsBase
        },
        // attractions: {
        //     url: tableAttractions,
        //     preview: tablePreviewAttractions,
        //     dbRef: ref.attractions
        // },
    },
    rum: {
        id: "rum",
        activity: {
            url: tableLkpActivitiesRum,
            dbRef: ref.lkpActivityRum
        },
        // attractions: {
        //     url: 
        // }
        // attractions: {
        //     url: tableAttractions,
        //     dbRef: ref.attractions
        // },
    }
})

function getAppLocation(appId) {
    if (!appLocation[appId]) {
        throw reply.error({
            errorCode: "InvalidAppId",
            message: "Supplied appId is invalid",
        })
    }
    return appLocation[appId];
}

const rumSearch = Object.freeze({
    "Tourist_camps": {
        url: tableRumCamps,
        dbRef: ref.rumCamps,
        previewValues: {
            [ref.rumCamps.telephoneNo]: {
                title: {
                    "ar": "رقم الهاتف",
                    "en": "Phone Number"
                },
                value: ref.rumCamps.telephoneNo
            },
            [ref.rumCamps.bedsCount]: {
                title: {
                    "ar": "عدد الأسرة",
                    "en": "Number of beds"
                },
                value: ref.rumCamps.bedsCount
            },
            [ref.rumCamps.campsProtectedType]: {
                title: {
                    "ar": "camp protection",
                    "en": "camp protection"
                },
                value: ref.rumCamps.campsProtectedType
            },
        }
    },
    "Drone_Camps": {
        url: tableRumDrones,
        dbRef: ref.rumDrones,
        previewValues: {}
    },
    "Tourist_Routes": {
        url: tableRumRoutes,
        dbRef: ref.rumTouristRoutes,
        previewValues: {
            [ref.rumTouristRoutes.routeLength]: {
                title: {
                    "ar": "طول الطريق",
                    "en": "Route Length"
                },
                value: ref.rumTouristRoutes.routeLength
            }
        }
    },
    "Mountain_Climbing_Areas": {
        url: tableRumMountain,
        dbRef: ref.rumMountainClimbing,
        previewValues: {
            [ref.rumMountainClimbing.area]: {
                title: {
                    "ar": "المساحة",
                    "en": "Area"
                },
                value: ref.rumMountainClimbing.area
            }
        }
    },
    "Rum_Attractions": {
        url: tableRumAttractions,
        dbRef: ref.rumAttractions,
        previewValues: {}
    },
    "Archaeological_Features": {
        url: tableRumArchaeological,
        dbRef: ref.rumArchaeological,
        previewValues: {
            [ref.rumArchaeological.subElementName]: {
                title: {
                    "ar": "نوع المعلم",
                    "en": "Archaeological Site Type"
                },
                value: ref.rumArchaeological.subElementName
            },
            [ref.rumArchaeological.elementPeriod]: {
                title: {
                    "ar": "الحقبة",
                    "en": "Element Period"
                },
                value: ref.rumArchaeological.elementPeriod
            },
            [ref.rumArchaeological.riskLevel]: {
                title: {
                    "ar": "شدة الخطورة",
                    "en": "Risk level"
                },
                value: ref.rumArchaeological.riskLevel
            }
        },
    }
})


module.exports = {
    rumSearch,
    appLocation,
    getAppLocation
}