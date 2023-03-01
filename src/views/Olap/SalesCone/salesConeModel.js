import { getJsonFromOlapApi } from '../../../api/response-handle';
import dateformat from 'dateformat';
import olapModelView from '../OlapComponents/olapModelView';
import Constants from './constants';

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

const CONE_DAYS_FOR_VIEW = -21;
const CONE_DAYS_FOR_DYNAMIC_CUP = -26 * 7;
const DEVIATON_THRL = 0.2;

//let coneResultMultiplier =  3;

let salesConeModel = Object.assign(Object.create(olapModelView), {
    MAIN_URL: '/api/olap/sales-cone',
    HIDDEN_COLS: [1, 2],
    EXCELCOLWIDTHS: [300, 50, 50, 30],

    _super: olapModelView,

    data: {},
    dynamicCUPdata: {},

    filters: {
        segmentFilter:
            process.env.NODE_ENV === 'development'
                ? '[Товары].[Товары].&[99841]'
                : '[Товары].[Товары].&[213571]', //  '[Товары].[Товары].[All].UNKNOWNMEMBER',
        //dateFilter: process.env.NODE_ENV === 'development' ? '2018-06-17' : dateformat(addDays(new Date(), - 1), 'yyyy-mm-dd'),
        periodFilter: {
            date:
                //process.env.NODE_ENV === 'development' ? '2019-11-01' :
                     dateformat(addDays(new Date(), 0), 'yyyy-mm-dd'),
            days: CONE_DAYS_FOR_VIEW + 1,
        },
        //shopFilter: ['[Подразделения].[Подразделение].[All]']
        filterArray: [
            [
                '[Товары].[Товары]',
                [process.env.NODE_ENV === 'development' ? '99841' : '99841'],
            ],
            //,['[Подразделения].[Подразделение]', ['201']]
        ],
    },

    convertDataToDisplay: function(data) {
        data.headerColumns.forEach((x, index) => {
            if (index > 0) x.label = x.label.replace(/^\W*(\d+).*/g, '$1');
            //move names, remain only number
            else x[0].Caption = 'Товар'; //todo move to backend

            //col properties by tag values
            switch (x[0].sign) {
                case 'item':
                    data.GOOD_COL_INDEX = index;
                    break;
                case 'total':
                    data.CUP_COL_INDEX = index;
                    break;
                case 'active':
                    data.ACTIVE_COL_INDEX = index;
                    break;
                case 'new':
                    data.NEW_COL_INDEX = index;
                    break;
            }
        });
    },

    getFilterOption: function(dimension) {

        return new Promise((resolve, reject) => {
            getJsonFromOlapApi('/api/olap/dim', { dim: dimension })
                .then(response => {
                    let options = response.data.rows.map(x => ({
                        value: x[0].UName,
                        label: x[0].Caption,
                        ...x[0],
                    }));

                    resolve(options);
                })
                .catch(e => reject(e));
        });
    },

    getDynamicCUPData: function(filters) {
        let model = this;

        return new Promise((resolve, reject) => {
            getJsonFromOlapApi('/api/olap/sales-cone/dynamic-cup', filters)
                .then(response => {
                    model.dynamicCUPdata = this.convertTableDataToChartData(
                        response.data
                    ); //for the furture, and storing filter inside
                    resolve(model.dynamicCUPdata);
                })
                .catch(e => reject(e));
        });
    },

    getDataCellPropertyById: function(cellId) {
        if (!cellId) return;
        let cell = this.getCellById(cellId);

        let property = {};

        // if (!cell) return property;
        if (this.data.rows.length === 0) return property; //todo why we enter here when table empty (before we watch property window).
        try {
            let good = this.data.rows[cell.y][cell.dataSetOnwer.GOOD_COL_INDEX];
            let shop = cell.headerCell[0];
            property.filter = {
                periodFilter: this.filters.periodFilter,
                shopFilter:
                    shop.UName && shop.UName.includes('&') > 0
                        ? shop.UName
                        : this.filters.shopFilter,
                goodFilter: good.UName,
            };
            Object.assign(property, {
                dynamicCUPdataFilter: {
                    ...property.filter,
                    periodFilter: {
                        date: this.filters.periodFilter.date,
                        days: CONE_DAYS_FOR_DYNAMIC_CUP,
                    },
                },
                goodName: good.Caption,
                cell: cell,
                КУП:
                    cell.x >= cell.dataSetOnwer.CUP_COL_INDEX
                        ? cell.FmtValue
                        : this.data.rows[cell.y][
                              cell.dataSetOnwer.CUP_COL_INDEX
                          ].FmtValue,
                'Отклонение %':
                    Math.round(
                        this.getDeviationOfCell(
                            cell,
                            cell.dataSetOnwer.CUP_COL_INDEX
                        ) * 10000
                    ) / 100,
            });
        } catch (e) {
            throw e;
        }

        //get additional values from server
        property.serverValuesPromise = new Promise((resolve, reject) => {
            if (!property.filter) {
                resolve(null);
                return;
            }

            getJsonFromOlapApi(
                '/api/olap/sales-cone/cell-property',
                property.filter
            )
                .then(response => {
                    let values = {};
                    if (response.data && response.data.rows.length) {
                        response.data.headerColumns.forEach((x, index) => {
                            //                console.dir(response.data.rows[0][index]);
                            values[x[0].Caption] =
                                response.data.rows[0][index].Caption ||
                                response.data.rows[0][index].FmtValue;
                        });
                    } else {
                        reject('no result');
                    }

                    //console.dir(values);
                    resolve(values);
                })
                .catch(e => reject(e));
        });

        return property;
    },

    getDeviationOfCell: function(cell, kupColIndex) {
        let cellCommonCup = cell.row[kupColIndex];
        let commonCUP = cellCommonCup && cellCommonCup.Value;

        return commonCUP > 0
            ? ((cell.Value - commonCUP) / commonCUP).toPrecision(4)
            : null;
    },

    getBackgroundColorOfCell: function(cell) {
        let res = null;
        if (cell.row === undefined) return res;

        if (cell.dataSetOnwer.NEW_COL_INDEX !== undefined)
            if (cell.row[cell.dataSetOnwer.NEW_COL_INDEX].Value === '1')
                res = Constants.newGoodColor;

        if (cell.dataSetOnwer.ACTIVE_COL_INDEX !== undefined)
            if (cell.row[cell.dataSetOnwer.ACTIVE_COL_INDEX].Value === '0')
                res = Constants.noActiveGoodColor;

        const cupColIndex = cell.dataSetOnwer.CUP_COL_INDEX;
        if (cupColIndex !== undefined) {
            if (!cell || cell.x > cupColIndex) {
                let deviation = this.getDeviationOfCell(cell, cupColIndex);
                if (deviation > DEVIATON_THRL) {
                    return Constants.deviationPositiveColor;
                }
                if (deviation < -DEVIATON_THRL && deviation > -1) {
                    return Constants.deviationNegativeColor;
                }
            }
        }
        return res;
    },
});

export default salesConeModel;
