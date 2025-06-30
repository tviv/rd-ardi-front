'use strict';

import React, { Component } from 'react';

import model from './checklistModel';
import ChecklistTableContainer from './ChecklistTableContainer';
import ChecklistFilter from './ChecklistFilter';

class ChecklistTableView extends Component {
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

    render() {
        return (
            <div>
                <ChecklistFilter                     
                    model={model}
                    onChange={this.handleChangeFilter}
                    defaultValues={this.defaultValues}
                    style={{ position: 'relative', zIndex: 300 }}
                    stopFilterSelection={this.state.stopFilterSelection} />
                <ChecklistTableContainer 
                    filters={this.state.filters}
                    onCellClick={this.handleCellClick}
                    cellId={this.state.cellId}
                    onRefresh={this.handleRefreshTable} />
            </div>
        );
    }
}

export default ChecklistTableView;
