import olapModelView from '../OlapComponents/olapModelView';
import { getJsonFromOlapApi } from '../../../api/response-handle';
import moment from 'moment';

let DAY_COLUMN = 0;

let checklistModel = Object.assign(Object.create(olapModelView), {
    MAIN_URL: '/api/olap/checklist',
    HIDDEN_COLS: [1],
    FROZEN_COLUMN_COUNT: 2,
    data: {},

    filters: {
        periodFilter: { //date: '2025-09-01', endDate: '2025-09-30'
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
            `dc_${rowIndex}`,
            {data: day}
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
                const columnType = this.getColumnType(col.headerCell.label || col.headerCell)
                const filter = {data: row[0].UName};
                if (columnType) col.clickProperty = {columnType}; //enable click only for some columns
                if (col.label === 'All') col.label = 'Все';
            })
        );
    },

    // getCellById: function(cellId) {
    //     if (!cellId || !this.data.rows) return null;
        
    //     const [colIndex, rowIndex] = cellId.replace('c_', '').split('_').map(Number);
    //     if (isNaN(rowIndex) || isNaN(colIndex)) return null;
        
    //     if (rowIndex >= 0 && rowIndex < this.data.rows.length && 
    //         colIndex >= 0 && colIndex < this.data.rows[rowIndex].length) {
    //         return {
    //             x: colIndex,
    //             y: rowIndex,
    //             cell: this.data.rows[rowIndex][colIndex],
    //             headerCell: this.data.headerColumns ? this.data.headerColumns[colIndex] : null
    //         };
    //     }
    //     return null;
    // },

    getColumnType: function(columnName) {
        if (!columnName) return null;
        
        // Map column names to types
        const columnTypeMap = {
            'Кол нарушений': 'violations',
            //'Факт Балл': 'score'
        };
        
        return columnTypeMap[columnName] || null;
    },

    getCellDetailProperty: function(cellId) {
        //console.log('getCellDetailProperty called with cellId:', cellId);
        if (!cellId) return null;
        
        const cell = this.getCellById(cellId);
        //console.log('Cell found:', cell);

        
        if (!cell) return null;
        
        const property = {
            columnType: cell.clickProperty?.columnType,
            cellValue: cell.Value || cell.label,
            serverDataPromise: () => this.getCellDetailData(cellId, cell.clickProperty)
        };
        
        return property;
    },

    getCellDetailData: function(cellId, {columnType}) {
        const cell = this.getCellById(cellId);
        if (!cell) return Promise.reject(new Error('Ячейка не найдена'));
        
        // Build API request based on current filters and cell position
        const filter = {...this.filters, ...cell.specFilter};
        filter.filterArray = [...filter.filterArray, ...cell.specFilter?.filterArray || []];
        if (!cell.row?.isTotal) filter.periodFilter = null;
        const rowFilter = cell.row[0].UName;
        if (rowFilter.includes('Дата')) 
            filter.data = rowFilter;
        else {
            filter.filterArray = [...filter.filterArray, rowFilter];
        }

        const requestData = {
            ...filter,
            cellPosition: {
                row: cell.y,
                column: cell.x
            },
            columnType: columnType
        };
        
        // Choose API endpoint based on column type
        const endpoint = columnType === 'violations' 
            ? '/api/olap/checklist?withDetails=true' 
            : '/api/olap/checklist/score';
        
        return getJsonFromOlapApi(endpoint, requestData)
            .then(response => {
                //console.log('Detail data response:', response);
                // Process the response based on column type
                if (columnType === 'violations') {
                    return this.processViolationsData(response.data);
                } else if (columnType === 'score') {
                    return {
                        actualScore: response.actual || 0,
                        plannedScore: response.planned || 0,
                        deviation: response.deviation || 0,
                        completionPercent: response.completionPercent || 0,
                        scoreDetails: response.details || {}
                    };
                }
                return response;
            })
            .catch(error => {
                console.error('Error fetching cell detail data:', error);
                throw error;
            });
    },

    processViolationsData: function(data) {
        if (!data || !data.rows) {
            return {
                totalViolations: 0,
                violations: []
            };
        }

        const violations = [];

        data.rows.forEach(row => {
            // Skip rows with "Unknown" violations (these are compliant entries)
            const violationCell = row.find(cell => 
                cell.hierarchy === "[Чеклист Нарушения].[Чеклист Нарушение]" && 
                !cell.Caption.includes('Unknown')
            );
            
            if (!violationCell || violationCell.Caption.includes('Unknown')) {
                return; // Skip this row
            }

            // Extract date
            const dateCell = row.find(cell => cell.hierarchy === "[Даты].[Дата]");
            const date = dateCell ? dateCell.Caption : 'Не указано';

            const itemCell = row.find(cell => cell.hierarchy === "[Чеклист Пункты].[Чеклист Пункты]");
            const item = itemCell ? itemCell.Caption : 'Не указано';

            const factCell = row[8];
            const fact = factCell ? factCell.Value : 'Не указано';

            // Extract subdivision
            const subdivisionCell = row.find(cell => cell.hierarchy === "[Подразделения].[Подразделение]");
            const subdivision = subdivisionCell ? subdivisionCell.Caption.split(' ')[0] : 'Не указано';

            // Parse violation string: "photo1;photo2;photoN - reason"
            const violationText = violationCell.Caption;
            const parts = violationText.split(' - ');
            const reason = parts.length > 1 ? parts[parts.length - 1] : 'Не указано';
            const photosString = parts.length > 1 ? parts.slice(0, -1).join(' - ') : violationText;
            
            // Split photos by semicolon and filter out empty ones
            const photos = photosString.split(';')
                .map(photo => photo.trim())
                .filter(photo => photo.length > 0);

            violations.push({
                date,
                subdivision,
                fact,
                reason,
                item,
                photos
            });
        });

        return {
            totalViolations: violations.length,
            violations
        };
    },
});

export default checklistModel;
