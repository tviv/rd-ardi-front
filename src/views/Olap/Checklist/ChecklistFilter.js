import React, { Component } from 'react';
import { FormGroup, Label, Col, Row } from 'reactstrap';

import model from './checklistModel';
import { AppSwitch } from '@coreui/react';
import FilterHandler from '../OlapComponents/FilterHandler';
import FilterContainer from '../OlapComponents/FilterContainer';
import RangeDatePicker from '../../components/RangeDatePicker';
import moment from 'moment';

class ChecklistFilter extends FilterHandler {
    handleDateChange = (startDate, endDate) => {
        model.filters.periodFilter.date = startDate;
        model.filters.periodFilter.endDate = endDate;
        if (this.props.onChange) {
            this.props.onChange();
        }
    };

    render() {

        let WrappedSelect = this.WrappedSelect;

        return (
            <FilterContainer>
                <Row>
                    <Col xs="12" lg="3">
                        <FormGroup>
                            <Label>Период</Label>
                            <RangeDatePicker
                                startDate={moment(
                                    model.filters.periodFilter.date
                                )}
                                endDate={moment(
                                    model.filters.periodFilter.endDate
                                )}
                                onChange={this.handleDateChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col xs="12" lg={{ size: 3, offset: 1 }}>
                        <FormGroup>
                            <Label htmlFor="shop-select">Магазины</Label>
                            <WrappedSelect
                                name="shop-select"
                                hierarchyName="[Подразделения].[Подразделение]"
                            />
                        </FormGroup>
                    </Col>
                    <Col xs="12" lg="3">
                        <FormGroup>
                            <Label>Районы</Label>
                            <WrappedSelect
                                hierarchyName="[Подразделения].[Район]"
                                maxLevel="1"
                            />
                        </FormGroup>
                    </Col>
                </Row>
            </FilterContainer>
        );
    }
}

export default ChecklistFilter;
