import olapModelView from '../OlapComponents/olapModelView';
import moment from 'moment';


let segmentRevenueModel = Object.assign(Object.create(olapModelView), {
    MAIN_URL: '/api/olap/segment/revenue',
    //HIDDEN_COLS: [1, 3],
    FROZEN_COLUMN_COUNT: 2,
    data: {},

    filters: {
        periodFilter: { //date: '2020-04-01', endDate: '2020-04-30'
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
        ],
    },

    getDetailData: function(rowIndex, filters = this.filters) {
        let model = this;
        let isSegment2DataView = true;

        let key = model.data.rows[rowIndex][0].UName;

        //todo move to filter class
        let _filter = {};

        if (model.data.rows[rowIndex].isTotal) {
            _filter = this.filters;
        } else {
            if (isSegment2DataView) {
                _filter.periodFilter = this.filters.periodFilter;
            } else {
            }
            _filter.filterArray = [...filters.filterArray];
            _filter.filterArray.push(key);
        }

        return this.getData(
            '/api/olap/segment/revenue-detail',
            _filter,
            `dc_${rowIndex}`
        );
    },

    getBackgroundColorOfColumn: function(cell) {
        let res = undefined;

        if (!cell) return res;

        let backColor = '#f0f8ff';
        if (cell.label &&
            (cell.label.indexOf('клиентов') >= 0 ||
                cell.label.indexOf('артикула') >= 0 ||
                cell.label.indexOf('борачиваемос') >= 0
            )
        ) res = backColor;

        return res;
    },

    // 1.	В колонках: «Отклонение выполнение по ВМ от выполнение по ТО», «Отклонение УВМ от плана», «Отклонение от плана Ср ст-ть артикула», «Отклонение от плана Кол артикулов на 1 клиента» - значения меньше нуля выделить красным цветом
    // 2.	В колонке «Отклонение от плана Коэф оборачиваемости» - значения больше нуля выделить красным цветом
    // 3.	В колонках: «Выполнение план сегмент Выручка без НДС», «Выполнение план сегмент Маржа без НДС», «Выполнение плана Кол клиентов», «Выполнение плана Кол артикулов» - значение меньше 95% выделять красным цветом, значения больше 103% выделить зеленым цветом

    getBackgroundColorOfCell: function(cell) {
        let res = null;

        if (!cell) return res;

        let forNegativVal = ["Отклонение выполнение по ВМ от выполнение по ТО", "Отклонение УВМ от плана", "Отклонение от плана Ср. ст-ть артикула", "Отклонение от плана Кол артикулов на 1 клиента"];
        let forNegativeValIfPos = ["Отклонение от плана Коэф оборачиваемости"];
        let kpi1 = ["Выполнение план сегмент Выручка без НДС", "Выполнение план сегмент Маржа без НДС", "Выполнение плана Кол клиентов", "Выполнение плана Кол артикулов"];
        let kpi2 = ["Доля Выручки без НДС"]
        if (cell.headerCell) {
            res = cell.headerCell.background;

            if (forNegativVal.includes(cell.headerCell.label)) {
                if (cell.Value < 0) return '#FCBFBF';
            } else if (forNegativeValIfPos.includes(cell.headerCell.label)) {
                if (cell.Value > 0) return '#FCBFBF';
            } else if (kpi1.includes(cell.headerCell.label)) {
                if (cell.Value > 1.03) return '#BEFCBA';
                if (cell.Value < 0.95) return '#FCBFBF';
            } else if (kpi2.includes(cell.headerCell.label)) {
                if (cell.Value > 0.01) return '#BEFCBA';
            }
        }

        return res;
    },

    convertDataToDisplay: function(data) {
        if (data.rows.length > 0 && data.rows[0][0].label === 'All') {
            data.rows[0].forEach((col, index) => {
                if (index === 0) col.label = 'Итого';
                if (index === 1 && col.label === 'All') col.label = null; //the detail columns is added to table
            });

            data.rows[0].isTotal = true;
            data.rows.push(data.rows[0]);
            data.rows.shift();
        }

        data.rows.forEach(row =>
            row.forEach(col => {
                if (col.label === 'All') col.label = 'Все';
                if (col.index === 0) col.maxWidth = '300px';
            })
        );
    },

    getExcelToDownload: function(index) {
        let model = this;
        switch (index) {
            case 0:
                return new Promise(resolve =>
                    resolve(model.convertDataToExcelFormat(model.data))
                );
            case 1: //request to detail data
                return new Promise((resolve, reject) => {
                    return model
                        .getData('/api/olap/segment/revenue-detail-expanded', model.filters)
                        .then(data =>
                            resolve(model.convertDataToExcelFormat(data))
                        )
                        .catch(e => reject());
                });
        }
    },
});

export default segmentRevenueModel;
