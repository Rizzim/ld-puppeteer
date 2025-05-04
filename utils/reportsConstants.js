const reportNameToIdMap = {
    'Adjustent Detail': 'bdd_option:retailer-reports-activity-filters-report-name-0',
    'Confirmed Invoice Detail': 'bdd_option:retailer-reports-activity-filters-report-name-1',
    'Full Statement': 'bdd_option:retailer-reports-activity-filters-report-name-2',
    'Pack Activity History': 'bdd_option:retailer-reports-activity-filters-report-name-3',
    'Pack Inventory': 'bdd_option:retailer-reports-activity-filters-report-name-4',
    'Packs Activated': 'bdd_option:retailer-reports-activity-filters-report-name-5',
    'Packs Returned': 'bdd_option:retailer-reports-activity-filters-report-name-6',
    'Packs Settled': 'bdd_option:retailer-reports-activity-filters-report-name-7',
    'Primary Incentive Potential Entries': 'bdd_option:retailer-reports-activity-filters-report-name-8',
    'Reconciliation Overview': 'bdd_option:retailer-reports-activity-filters-report-name-9',
    'Retailer Average Weekly Sales': 'bdd_option:retailer-reports-activity-filters-report-name-10',
    'Retailer Packs Earned': 'bdd_option:retailer-reports-activity-filters-report-name-11',
    'Statement Summary': 'bdd_option:retailer-reports-activity-filters-report-name-12',
    'Validations - Mid-Tier Detail': 'bdd_option:retailer-reports-activity-filters-report-name-13',
    'Validations Summary': 'bdd_option:retailer-reports-activity-filters-report-name-14',
    'Draw Game Summary': 'bdd_option:retailer-reports-activity-filters-report-name-15',
    'Primary Incentive Payment History': 'bdd_option:retailer-reports-activity-filters-report-name-16',
    'Primary Incentive Potential Payment': 'bdd_option:retailer-reports-activity-filters-report-name-17',
    'Secondary Incentive Payment History': 'bdd_option:retailer-reports-activity-filters-report-name-18',
    'Secondary Incentive Potential Payment': 'bdd_option:retailer-reports-activity-filters-report-name-19',
    'Secondary Potential Entries': 'bdd_option:retailer-reports-activity-filters-report-name-20',
    'Status for Primary Incentive': 'bdd_option:retailer-reports-activity-filters-report-name-21',
    'Status for Secondary Incentive': 'bdd_option:retailer-reports-activity-filters-report-name-22',
    'Packs Returned - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-23',
    'Pack Inventory - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-24',
    'Full Statement - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-25',
    'Pack Activity History - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-26',
    'Adjustent Detail - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-27',
    'Packs Settled - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-28',
    'Validations - Mid-Tier Detail - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-29',
    'Confirmed Invoice Detail - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-30',
    'Packs Activated - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-31',
    'Draw Game Summary - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-32',
    'Retailer Packs Earned - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-33',
    'Validations Summary - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-34',
    'Statement Summary - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-35',
};

// Create reverse map: ID → Name
const reportIdToNameMap = Object.fromEntries(
    Object.entries(reportNameToIdMap).map(([name, id]) => [id, name])
);

export default {
    reportNameToIdMap,
    reportIdToNameMap
};