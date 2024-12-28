'use strict';

import React, { Component } from 'react';

import model from './segmentYearToYearModel';
import SegmentYearToYearTableContainer from './SegmentYearToYearTableContainer';
import SegmentFilter from '../SegmentRevenue/SegmentRevenueFilter';

class SegmentYearToYearTableView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filters: model.filters,
            cellId: null,
        };
    }

    defaultValues = new Map(model.filters.filterArray);

    handleChangeFilter = filterMap => {
        if (filterMap) {
            console.log('filter', filterMap, model)
            model.filters.filterArray =
                filterMap instanceof Map
                    ? Array.from(filterMap.entries())
                    : filterMap;
        }
        this.setState({
            filters: Object.assign({}, model.filters), //to recognise that child component table must be update
            stopFilterSelection: false,
        });
    };

    handleRefreshTable = () => {
        this.setState({ stopFilterSelection: true });
    };

    render() {
        return (
            <div>
                <SegmentFilter
                    model={model}
                    onChange={this.handleChangeFilter}
                    defaultValues={this.defaultValues}
                    style={{ position: 'relative', zIndex: 300 }}
                    stopFilterSelection={this.state.stopFilterSelection}
                />
                <SegmentYearToYearTableContainer
                    filters={this.state.filters}
                    onCellClick={this.handleCellClick}
                    cellId={this.state.cellId}
                    onRefresh={this.handleRefreshTable}
                />
            </div>
        );
    }
}

export default SegmentYearToYearTableView;
