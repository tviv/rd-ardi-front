import { getJsonFromOlapApi } from '../../../api/response-handle';
import { FETCH_ERROR } from 'ra-core';
import { connect } from 'react-redux';

const fetchError = error => ({
    type: FETCH_ERROR,
    error,
});

let olapModelView = {
    MAIN_URL: '/api/olap/...',
    HIDDEN_COLS: [],
    EXCELCOLWIDTHS: [190, 80],

    data: {},
    dynamicCUPdata: {},

    filters: {
        filterArray: [],
    },

    //---------------MODEL VIEW----------------------
    getMainData: function(filters = this.filters) {
        return this.getData(this.MAIN_URL, filters);
    },

    getData: function(url, options, cellPrefixId = 'c', specFilter = undefined) {
        let model = this;

        return new Promise((resolve, reject) => {
            getJsonFromOlapApi(url, options)
                .then(response => {
                    //refine header objects
                    this.convertHeaderToDisplay(response.data);

                    //set cellId
                    response.data.rows.forEach((row, yInd) => {
                        row.forEach((cell, xInd) => {
                            Object.assign(cell, {
                                cellId: `${cellPrefixId}_${xInd}_${yInd}`,
                                label: cell.FmtValue
                                    ? (['1,#INF', '-1,#IND', '1,#QNAN'].includes(cell.FmtValue) ? null : cell.FmtValue)
                                    : cell.Caption,
                                x: xInd,
                                y: yInd,
                                row: row,
                                headerCell:
                                    response.data.headerColumns[xInd],
                                dataSetOnwer: response.data,
                                hidden: this.HIDDEN_COLS.includes(xInd),
                                specFilter: specFilter,
                            });
                            model.cellMap.set(cell.cellId, cell);
                        });
                    });

                    //some visual logic
                    this.convertDataToDisplay(response.data);

                    //background color
                    response.data.rows.forEach((row, yInd) =>
                        row.forEach(
                            cell => cell.background = this.getBackgroundColorOfCell(cell)
                        )
                    );

                    //return result
                    resolve(response.data);
                })
                .catch(e => {
                    reject(e);
                });
        });
    },

    convertHeaderToDisplay: function(data) {
        data.headerColumns = data.headerColumns.map((item, index) => {
            let cell = {
                [0]: item[0],
                label: item[0].Caption,
                x: index,
                y: 0,
                hidden: this.HIDDEN_COLS.includes(index),
            };
            cell.background = this.getBackgroundColorOfColumn(cell) || this.getBackgroundColorOfCell(cell);
            return cell;
        });
    },

    convertDataToDisplay: function(data) {},

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
                .catch((descr, e) => reject(descr, e));
        });
    },

    cellMap: new Map(),

    getCellById: function(cellId) {
        return this.cellMap.get(cellId);
    },

    // getCellColor: function (cellId) {
    //   return this.getBackgroundColorOfCell(this.getCellById(cellId));
    // },

    getBackgroundColorOfCell: function(cell) {
        let res = null;

        return res;
    },

    getBackgroundColorOfColumn: function(headerCell) {
        let res = null;

        return res;
    },

    //now only for col to labels
    convertTableDataToChartData: function(data) {
        let result = {
            labels: [],
            datasets: [],
        };
        data.headerColumns.forEach((item, index) => {
            if (index > 0) result.labels.push(item[0].Caption);
        });

        data.rows.map((item, index) => {
            let dataset = {
                data: [],
            };
            result.datasets.push(dataset);
            item.map((col, index) => {
                if (index === 0) dataset.label = col.Caption;
                else dataset.data.push(col.Value);
            });
        });

        return result;
    },

    getExcelToDownload: function() {
        let model = this;
        return new Promise(resolve => {
            if (model.data) resolve(this.convertDataToExcelFormat(model.data));
            else resolve(null);
        });
    },

    convertDataToExcelFormat: function(data) {
        let widths = this.EXCELCOLWIDTHS;
        let res = [
            {
                columns: data.headerColumns.map((x, ind) => {
                    return {
                        title: x.label,
                        width: {
                            wpx:
                                ind < widths.length
                                    ? widths[ind]
                                    : widths[widths.length - 1],
                        },
                    };
                }),
                data: data.rows.map((row, rowIndex) =>
                    row.map((col, index) => {
                        return {
                            value:
                                (col.Value
                                    ? parseFloat(
                                    Math.round(col.Value * 10000) / 10000
                                ) || col.label
                                    : col.label) || '',
                            style: {
                                font: {
                                    sz: '10',
                                    bold: row.isTotal,
                                },
                                border: {
                                    top: row.isTotal && {
                                        style: 'thin',
                                        color: { rgb: '888888' },
                                    },
                                },
                                alignment: {
                                    horizontal: undefined,
                                },
                                numFmt: col.FormatString,
                                fill: col.background && {
                                    patternType: 'solid',
                                    fgColor: {
                                        rgb:
                                            'FF' +
                                            col.background.replace('#', ''),
                                    },
                                },
                            },
                        };
                    })
                ),
            },
        ];
        return res;
    },

    convertFilterArrayToOptions(options, filter, onlyTrailNumbers = false) {
        let res =
            filter &&
            filter.map(x => {
                let opt = this.getOptionByValue(options, x);
                let label =
                    opt &&
                    (onlyTrailNumbers
                        ? this.extractOnlyTrailNumber(opt.label)
                        : opt.label);
                return {
                    value: x,
                    label: label,
                };
            });
        return res;
    },

    getOptionByValue(options, value) {
        return options.find(x => x.value === value);
    },

    extractOnlyTrailNumber(value) {
        return value && value.replace(/^.*[- ]/g, '');
    },
};

export default olapModelView;
