import React, { Component } from 'react';
import {
  FormGroup,
  Label,
  Input,
  Popover,
  PopoverHeader,
  PopoverBody,
  Button,
  Collapse,
   Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table } from 'reactstrap';
import model from "./dailyRevenueModel";
import { AppSwitch } from '@coreui/react'
import FilterHandler from "../OlapComponents/FilterHandler";
import FilterContainer from "../OlapComponents/FilterContainer";

class DailyRevenueFilter extends FilterHandler {

  render() {
    let WrappedSelect = this.WrappedSelect;
    return  (
      <FilterContainer>
          <Row>
            <Col xs="12" lg="3">
              <FormGroup>
                <Label htmlFor="mounth-select">Месяцы</Label>
                <WrappedSelect
                  name="mounth-select"
                  hierarchyName = '[Даты].[Месяцы]'
                  maxLevel = '2'
                  disableToLevel = {1}
                  simpleSelect={true} />
              </FormGroup>
            </Col>
            <Col xs="12" lg="3">
              <FormGroup>
                <Label htmlFor="shop-select">Магазины</Label>
                <WrappedSelect name="shop-select" hierarchyName = '[Подразделения].[Подразделение]' />
              </FormGroup>
            </Col>
            <Col xs="12" lg="2">
              <FormGroup>
                <div><Label htmlFor="act-select">LKL</Label></div>
                <AppSwitch name="act-select" className={'mx-1'} color={'primary'} outline={'alt'} onChange={event=>{this.handleChange('[Подразделения].[Like for like]', [event.target.checked ? 'Да': '0'])}}/>
              </FormGroup>
            </Col>

          </Row>
          <Row>
            <Col xs="12" lg="3">
              <FormGroup>
                <Label htmlFor="org-select">Организации</Label>
                <WrappedSelect name="shop-select" hierarchyName = '[Подразделения].[Организации]' maxLevel = '1'  />
              </FormGroup>
            </Col>
            <Col xs="12" lg="3">
              <FormGroup>
                <Label >РУ</Label>
                <WrappedSelect hierarchyName = '[Подразделения].[Районые управляющие]' maxLevel = '1'  />
              </FormGroup>
            </Col>
            <Col xs="12" lg="3">
              <FormGroup>
                <Label >Подформаты</Label>
                <WrappedSelect hierarchyName = '[Подразделения].[Подформаты]' maxLevel = '1'  />
              </FormGroup>
            </Col>
            <Col xs="12" lg="3">
              <FormGroup>
                <Label >Направления</Label>
                <WrappedSelect hierarchyName = '[Товары].[Направление менеджера]' />
              </FormGroup>
            </Col>

          </Row>
      </FilterContainer>
    )
  }
}

export default DailyRevenueFilter;
