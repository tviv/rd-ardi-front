import olapModelView from '../OlapComponents/olapModelView';
import moment from 'moment';

let DAY_COLUMN = 0;

let checklistModel = Object.assign(Object.create(olapModelView), {
    MAIN_URL: '/api/olap/checklist',
    HIDDEN_COLS: [1],
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
            // ...
        ],
    },

    getDetailData: function(rowIndex, filters = this.filters) {
        let model = this;
        let day = model.data.rows[rowIndex][DAY_COLUMN].UName;
        let _filter = {};
        if (model.data.rows[rowIndex].isTotal) {
            _filter = this.filters;
        } else {
            _filter.filterArray = [...filters.filterArray];
            _filter.filterArray.push(day);
        }
        return this.getData(
            '/api/olap/checklist/day-shop',
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
            ['Соответствие '].includes(cell.headerCell.label)
        ) {
            if (cell.Value === 'Соответствует') return '#BEFCBA';
            if (cell.Value === 'Не соответствует') return '#FCBFBF';
            return '#FCFCBA';
        }

        return res;
    },

    convertDataToDisplay: function(data) {
        if (data.rows.length > 0 && data.rows[0][0].label === 'All') {
            data.rows[0].forEach((col, index) => {
                if (index === 0) col.label = 'Итого';
                if (index === 1 && col.label === 'All') col.label = null;
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
    },
});

export default checklistModel;
