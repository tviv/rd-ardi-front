'use strict';

import { getJsonFromOlapApi } from '../../../api/response-handle';
import dateformat from 'dateformat';
import olapModelView from '../OlapComponents/olapModelView';
import Constants from './constants';

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

const GOOD_COLUMN = 0;
const KUP_COLUMN = 3;
const CONE_DAYS_FOR_VIEW = -21;
const CONE_DAYS_FOR_DYNAMIC_CUP = -26 * 7;

//let coneResultMultiplier =  3;

let salesConeModel = Object.assign(Object.create(olapModelView), {
    MAIN_URL: '/api/olap/sales-cone',
    HIDDEN_COLS: [1],
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
                process.env.NODE_ENV === 'development'
                    ? '2018-06-11'
                    : dateformat(addDays(new Date(), 0), 'yyyy-mm-dd'),
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
            if (index > 0) x[0].Caption = x[0].Caption.replace(/^.*[- ]/g, '');
            //move names, remain only number
            else x[0].Caption = 'Товар'; //todo move to backend
        });
    },

    getFilterOption: function(dimension) {
        let model = this;

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
        let model = this;
        let cell = this.getCellById(cellId);

        let property = {};

        // if (!cell) return property;
        if (this.data.rows.length === 0) return property; //todo why we enter here when table empty (before we watch property window).
        try {
            let good = this.data.rows[cell.y][GOOD_COLUMN];
            let shop = cell.headerCell;
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
                    cell.x > KUP_COLUMN
                        ? cell.FmtValue
                        : this.data.rows[cell.y][KUP_COLUMN].FmtValue,
                'Отклонение %':
                    Math.round(this.getDeviationOfCell(cell) * 10000) / 100,
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

    getDeviationOfCell: function(cell) {
        let cellCommonCup = cell.row[KUP_COLUMN];
        let commonCUP = cellCommonCup.Value;

        return commonCUP > 0
            ? ((cell.Value - commonCUP) / commonCUP).toPrecision(4)
            : null;
    },

    getBackgroundColorOfCell: function(cell) {
        let res = null;
        if (cell.row === undefined) return res;

        if (cell.row[1].Value == 'Нет') res = Constants.noActiveGoodColor;

        if (!cell || cell.x < KUP_COLUMN) return res;

        let deviation = this.getDeviationOfCell(cell);
        if (deviation > 0.2) {
            return Constants.deviationPositiveColor;
        }
        if (deviation < -0.2 && deviation > -1) {
            return Constants.deviationNegativeColor;
        }

        return res;
    },
});

export default salesConeModel;
