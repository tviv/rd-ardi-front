import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Col, Row } from 'reactstrap';
import SegmentYearToYearTableView from './SegmentYearToYearTableView';

class RevenueForm extends Component {
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" sm="12">
                        <Card>
                            <CardHeader>
                                <strong>Выручка по сегментам год к году</strong>
                            </CardHeader>
                            <CardBody>
                                <SegmentYearToYearTableView />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default RevenueForm;
