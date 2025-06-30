import React, { PureComponent } from 'react';
import model from './checklistModel';
import OlapTableContainer from '../OlapComponents/OlapTableContainer';

class ChecklistTableContainer extends PureComponent {
    //todo move to filter block
    checkFilters = filters => {
        let vals = new Map(filters.filterArray).get('[Даты].[Месяцы]');
        let res = (vals && vals.length > 0 && !vals.includes('0')) || true;
        if (res) return undefined;
        else return 'Нет ограничения по дате';
    };

    onExpand = rowIndex => {
        return model.getDetailData(rowIndex, this.props.filters);
    };

    render() {
        return (
            <OlapTableContainer
                {...this.props}
                title="Чек-листы"
                frozenCols={model.FROZEN_COLUMN_COUNT + 1}
                valueColumnsOffset={2}    
                model={model}
                checkFilters={this.checkFilters}
                onExpand={this.onExpand}
            />
        );
    }
}

export default ChecklistTableContainer;
