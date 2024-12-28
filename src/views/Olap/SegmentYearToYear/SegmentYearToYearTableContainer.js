import React, { PureComponent } from 'react';
import model from './segmentYearToYearModel';
import OlapTableContainer from '../OlapComponents/OlapTableContainer';

class SegmentYearToYearTableContainer extends PureComponent {
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
                title=""
                model={model}
                frozenCols={model.FROZEN_COLUMN_COUNT}
                checkFilters={this.checkFilters}
                onExpand={this.onExpand}
                downloadOptions={[
                    'Краткая форма'
                ]}
                valueColumnsOffset={1}
                {...this.props}
            />
        );
    }
}

export default SegmentYearToYearTableContainer;
