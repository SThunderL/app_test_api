const layers = require("./layers.json")

module.exports = {
    tableLandRules: layers.featureServer.links.VIEW_LAND_RULE,
    tableLandRulesConnected: layers.featureServer.links.VIEW_LAND_CONNECTED_RULE,
    tableMapPlanning: layers.featureServer.links.Physical_Planning_Master,

    idLandRules: layers.featureServer.ids.VIEW_LAND_RULE,
    idLandRulesConnected: layers.featureServer.ids.VIEW_LAND_CONNECTED_RULE,
    idMapPlanning: layers.featureServer.ids.Physical_Planning_Master,

    baseMapPlanning: layers.mapServer.base["Aseza/Zoning_Site_Plan_Service"],

    tableAttractions: layers.featureServer.links.Tourist_Facilities,
    tableAttractionTypeTranslation: layers.featureServer.links.Tourist_Trans_Type_LKP,
    tableAttractionReview: layers.featureServer.links.Tourist_Facility_Review,
    tableAttractionActivities: layers.featureServer.links.Tourist_Activities,
    tableAttractionDescription: layers.featureServer.links.Tourist_Trans_Facility_Description,
    tableAttractionWorkDays: layers.featureServer.links.Tourist_Work_Info,
    tableLkpActivities: layers.featureServer.links.Tourist_Activities_LKP,
    tableLkpActivitiesCategories: layers.featureServer.links.Tourist_Activities_Category_LKP,

    tablePreviewAttractions: layers.mapServer.links.Tourist_Facilities_Preview,
    tableLkpActivitiesRum: layers.featureServer.links.Wadi_Rum_Activities_LKP,

    tableRumActivites: layers.featureServer.links.Wadi_Rum_Activities,
    tableRumSearchIndex: layers.featureServer.links.Wadi_Rum_Search_Index,
    tableRumCamps: layers.featureServer.links.Tourist_camps,
    tableRumDrones: layers.featureServer.links.Drone_Camps,
    tableRumRoutes: layers.featureServer.links.Tourist_Routes,
    tableRumMountain: layers.featureServer.links.Mountain_Climbing_Areas,
    tableRumAttractions: layers.featureServer.links.Rum_Attractions,
    tableRumArchaeological: layers.featureServer.links.Archaeological_Features,

    // vocations
    tableVocationalLicensePoint: layers.featureServer.links.Vocations_Licenses_Point,
    tableCompanyPermits: layers.mapServer.links.CompanyPermits,
    tableCompanyRegistration: layers.mapServer.links.Company_Regisration,
    
    tableParcels: layers.featureServer.links.parcel_pal_wgs,
    tableLandmarkCarRent: layers.featureServer.links.Car_Rent_Landmarks,
    tablelandmarkTaxi: layers.mapServer.links.Taxi_Station_Landmarks,
    tableTaxiOffice: layers.mapServer.links.vw_TaxiOffice,
    tableRentalOffice: layers.mapServer.links.vw_RentalOffice,

    tableBusesPrivateData: layers.mapServer.links.vw_PrivateBusCompanyData,
    tableBusesPrivateCompanies: layers.mapServer.links.vw_PBCompanies,
    tableBusesPrivate: layers.featureServer.links.Private_Bus_Company,

}