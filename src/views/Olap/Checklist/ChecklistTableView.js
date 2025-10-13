'use strict';

import React, { Component } from 'react';
import { FormGroup, Row, Col } from 'reactstrap';

import model from './checklistModel';
import ChecklistTableContainer from './ChecklistTableContainer';
import ChecklistFilter from './ChecklistFilter';
import ChecklistCellDetailWindow from './ChecklistCellDetailWindow';

class ChecklistTableView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filters: model.filters,
            cellId: null,
            popoverOpen: false,
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

    handleCellClick = cellId => {
        //console.log('Cell clicked:', cellId);
        //const cellProperty = model.getCellDetailProperty(cellId);
        //console.log('Cell property:', cellProperty);
        
        // // Only show popup for specific columns (violations and score)
        // if (!this.state.popoverOpen && !cellProperty) {
        //     console.log('No cell property found, returning early');
        //     return;
        // }

        const handler = () => {
            //console.log('Setting popup state, cellId:', cellId, 'current state:', this.state);
            this.setState({
                popoverOpen:
                    this.state.cellId === cellId ? !this.state.popoverOpen : true,
                cellId: cellId,
            });
        };

        if (this.state.popoverOpen) {
            setTimeout(handler, 100); // to avoid closing by the toggle event
        } else {
            handler();
        }
    };

    handlePopupWindowToggle = () => {
        this.setState({
            popoverOpen: false,
        });
    };

    handleRefreshTable = () => {
        this.setState({ stopFilterSelection: true });
    };

    render() {
        return (
            <div>
                <Row>
                    <Col xs="12" lg="12">
                        <FormGroup>
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
                            <ChecklistCellDetailWindow
                                cellId={this.state.cellId}
                                property={model.getCellDetailProperty(this.state.cellId)}
                                isOpen={this.state.popoverOpen}
                                toggle={this.handlePopupWindowToggle}
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ChecklistTableView;
