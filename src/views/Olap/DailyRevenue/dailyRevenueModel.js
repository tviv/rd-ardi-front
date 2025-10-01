import olapModelView from '../OlapComponents/olapModelView';
import moment from 'moment';

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

let DAY_COLUMN = 0;
let COMMENT_COUNT_COLUMN = 3;

let ORDER_COLUMN_START = 21;
let NOCASH_COLUMN_START = ORDER_COLUMN_START + 8;
let NIGHT_TIME_COLUMN_START = NOCASH_COLUMN_START + 6;
let CERTIFICATE_COLUMN_START = NIGHT_TIME_COLUMN_START + 4;
let SBER_COLUMN_START = CERTIFICATE_COLUMN_START + 2;
let ECOM_COLUMN_START = SBER_COLUMN_START + 6;
let COMMENT_COLUMN_START = ECOM_COLUMN_START + 3;

let dailyRevenueModel = Object.assign(Object.create(olapModelView), {
    MAIN_URL: '/api/olap/daily-revenue',
    HIDDEN_COLS: [1, 3],
    FROZEN_COLUMN_COUNT: 2,
    data: {},

    filters: {
        periodFilter: {
            date: moment()
                .add(-1, 'day')
                .startOf('month')
                .format('YYYY-MM-DD'),
            endDate: moment()
                .add(-1, 'day')
                .endOf('month')
                .format('YYYY-MM-DD'),
        },
        filterArray: [
            // [
            //     '[Даты].[Месяцы]',
            //     [
            //         process.env.NODE_ENV === 'development'
            //             ? '2019-09-01T00:00:00'
            //             : '2019-09-01T00:00:00',
            //     ],
            // ],
        ],
    },

    getDetailData: function(rowIndex, filters = this.filters) {
        let model = this;

        let day = model.data.rows[rowIndex][DAY_COLUMN].UName;

        //todo move to filter class
        let _filter = {};

        if (model.data.rows[rowIndex].isTotal) {
            _filter = this.filters;
        } else {
            _filter.filterArray = [...filters.filterArray];
            _filter.filterArray.push(day);
        }

        return this.getData(
            '/api/olap/daily-revenue-day-shop',
            _filter,
            `dc_${rowIndex}`
        );
    },

    cellMap: new Map(),

    getBackgroundColorOfCell: function(cell) {
        let res = null;

        if (!cell) return res;
        if (
            cell.headerCell &&
            ['Выполнение плана выручки без НДС', 'Выполнение плана маржи без НДС'].includes(cell.headerCell.label)
        ) {
            if (cell.Value >= 1.05) return '#BEFCBA';
            if (cell.Value > 0 && cell.Value <= 0.97) return '#FCBFBF';
        }

        if (cell.x === DAY_COLUMN || cell.x === COMMENT_COLUMN_START) {
            if (cell.row && cell.row[COMMENT_COUNT_COLUMN].Value > 0)
                return '#BFFCE7';
        }

        if (cell.x >= COMMENT_COLUMN_START) return null;
        if (cell.x >= ECOM_COLUMN_START) return '#E7DFEF';
        if (cell.x >= SBER_COLUMN_START) return '#DEF7E0';
        if (cell.x >= CERTIFICATE_COLUMN_START) return '#EFF3DE';
        if (cell.x >= NIGHT_TIME_COLUMN_START) return '#DEEFF7';
        if (cell.x >= NOCASH_COLUMN_START) return '#E7DFEF';
        if (cell.x >= ORDER_COLUMN_START) return '#DEF7E0';

        return res;
    },

    convertDataToDisplay: function(data) {
        if (data.rows.length > 0 && data.rows[0][0].label === 'All') {
            //data.rows[0][0].label = 'Итого';
            data.rows[0].forEach((col, index) => {
                if (index === 0) col.label = 'Итого';
                if (index === 1 && col.label === 'All') col.label = null; //the shop columns is added to table
                //col.bold = true;
            });

            data.rows[0].isTotal = true;
            data.rows.push(data.rows[0]);
            data.rows.shift();
        }

        data.rows.forEach(row =>
            row.forEach(col => {
                if (col.label === 'All') col.label = 'Все';
            })
        );

        data.rows.forEach((row, index) => {
            if (row[COMMENT_COLUMN_START].Value) {
                if (row.isTotal) {
                    row[COMMENT_COLUMN_START].label = `${
                        row[COMMENT_COUNT_COLUMN].Value
                    } шт.`;
                }
                row[0].tooltip =
                    row[COMMENT_COUNT_COLUMN].Value > 1 || row.isTotal
                        ? `Комментариев: ${row[COMMENT_COUNT_COLUMN].Value} шт.`
                        : `${row[COMMENT_COLUMN_START].label}`;
            }
        });
    },

    getExcelToDownload: function(index) {
        let model = this;
        switch (index) {
            case 0: //what we see
                return new Promise(resolve =>
                    resolve(model.convertDataToExcelFormat(model.data))
                );
            case 1: //request to detail data
                let options = { ...model.filters, withShopColumn: true };
                return new Promise((resolve, reject) => {
                    return model
                        .getMainData(options)
                        .then(data =>
                            resolve(model.convertDataToExcelFormat(data))
                        )
                        .catch(e => reject());
                });
        }
    },

    convertDataToExcelFormat: function(data) {
        if (!data) return null;

        let widths = [80, 80];
        //let headerRow = data.headerColumns.map((x, ind) =>{return {value: x.label, style: {font: {sz: "10"}}, width: {wpx: ind < widths.length ? widths[ind] : widths[widths.length-1]}}});
        let res = [
            {
                columns: data.headerColumns.map((x, ind) => {
                    return {
                        title: x.label,
                        style: {
                            font: { sz: '10', bold: true },
                            alignment: {
                                vertical: 'center',
                                horizontal: 'center',
                                wrapText: 'true',
                            },
                            border: {
                                bottom: {
                                    style: 'medium',
                                    color: { rgb: '888888' },
                                },
                            },
                            fill: x.background && {
                                patternType: 'solid',
                                fgColor: {
                                    rgb: 'FF' + x.background.replace('#', ''),
                                },
                            },
                        },
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
                                    horizontal:
                                        index > 0 ? 'center' : undefined,
                                },
                                numFmt: col.label
                                    ? col.label.charAt(col.label.length - 1) ===
                                      '%'
                                        ? '#,##0.00%'
                                        : '#,##0.00'
                                    : undefined,
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
});

export default dailyRevenueModel;
