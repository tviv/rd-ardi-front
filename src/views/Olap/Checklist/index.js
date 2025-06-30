import React, { Component } from 'react';
import { Card, CardHeader, CardBody, Col, Row } from 'reactstrap';
import ChecklistTableView from './ChecklistTableView';

class ChecklistForm extends Component {
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" sm="12">
                        <Card>
                            <CardHeader>
                                <strong>Чек-листы</strong>
                            </CardHeader>
                            <CardBody>
                                <ChecklistTableView />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ChecklistForm;
