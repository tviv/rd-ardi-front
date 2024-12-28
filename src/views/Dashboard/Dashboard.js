import React, { Component } from 'react';
import { CardDeck, Card, CardBody, Col, Row, Jumbotron } from 'reactstrap';

import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { Link } from 'react-router-dom';
import ActualityWidget from '../Olap/Actuality/ActualityWidget';
import { connect } from 'react-redux';
import { actualHide, actualUpdate } from '../../actions/extraActions';

const brandPrimary = getStyle('--primary');
const brandSuccess = getStyle('--success');
const brandInfo = getStyle('--info');
const brandWarning = getStyle('--warning');
const brandDanger = getStyle('--danger');

class Dashboard extends Component {

    componentDidMount() {
        const { actualUpdate, actualHide } = this.props;

        actualUpdate();
        actualHide();
    }


    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" sm="6" lg="3">
                        <ActualityWidget />
                    </Col>
                </Row>
                <Row>
                    <CardDeck>

                        <Card>
                            <CardBody>
                                <Jumbotron>
                                    <h1 className="display-4">
                                        Воронка продаж
                                    </h1>
                                    <p className="lead">
                                        Отчет показывает уровень приобретения
                                        товаров по магазинам и сети в целом,
                                        выраженный в виде количества условных
                                        покупателей в неделю.
                                    </p>
                                    <hr className="my-2" />
                                    <p>
                                        Отчет используется коммерческим
                                        департаментом.
                                    </p>
                                    <p className="lead">
                                        <Link
                                            to="/olap/sales-cone"
                                            className="btn btn-primary"
                                        >
                                            Открыть
                                        </Link>
                                    </p>
                                </Jumbotron>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <Jumbotron>
                                    <h1 className="display-4">
                                        Ежедневная выручка
                                    </h1>
                                    <p className="lead">
                                        В отчете собраны все основные
                                        показатели по сети и магазинам,
                                        необходимые для ежедневного анализа
                                        деятельности компании
                                    </p>
                                    <hr className="my-2" />
                                    <p>
                                        Отчет предназначен для служб,
                                        ответственных за выполнение основных
                                        показателей по магазинам.
                                    </p>
                                    <p className="lead">
                                        <Link
                                            to="/olap/daily-revenue"
                                            className="btn btn-primary"
                                        >
                                            Открыть
                                        </Link>
                                    </p>
                                </Jumbotron>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <Jumbotron>
                                    <h1 className="display-4">
                                        Выручка по сегментам
                                    </h1>
                                    <p className="lead">
                                        В отчете представлены
                                        плановые и фактические показатели продаж в разрезе сегментов.
                                    </p>
                                    <hr className="my-2" />
                                    <p>
                                        Отчет предназначен для служб,
                                        ответственных за выполнение основных
                                        показателей по магазинам.
                                    </p>
                                    <p className="lead">
                                        <Link
                                            to="/olap/segment-revenue"
                                            className="btn btn-primary"
                                        >
                                            Открыть
                                        </Link>
                                    </p>
                                </Jumbotron>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <Jumbotron>
                                    <h1 className="display-4">
                                        Выручка по сегментам год к году
                                    </h1>
                                    <p className="lead">
                                        В отчете представлены
                                        плановые и фактические показатели продаж в разрезе сегментов и прошлого года.
                                    </p>
                                    <hr className="my-2" />
                                    <p>
                                        Отчет предназначен для служб,
                                        ответственных за выполнение основных
                                        показателей по магазинам.
                                    </p>
                                    <p className="lead">
                                        <Link
                                            to="/olap/segment-year-to-year"
                                            className="btn btn-primary"
                                        >
                                            Открыть
                                        </Link>
                                    </p>
                                </Jumbotron>
                            </CardBody>
                        </Card>
                    </CardDeck>
                </Row>
            </div>
        );
    }
}

export default connect(
    undefined,
    { actualHide, actualUpdate }
)(Dashboard);
