import React, { Component } from 'react';
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import LoadingWrappedView from '../../components/LoadingWrappedView';

class ChecklistCellDetailWindow extends Component {
    state = {
        data: this.props.property,
        detailData: null,
        loading: false,
        error: null,
    };

    componentWillReceiveProps(props) {
        //console.log('ChecklistCellDetailWindow props:', props);
        if (props.isOpen && props.property && props.property.serverDataPromise) {
            this.setState({ loading: true, detailData: null, error: null });
            
            // Call the function to get the promise
            const promise = typeof props.property.serverDataPromise === 'function' 
                ? props.property.serverDataPromise() 
                : props.property.serverDataPromise;
            
            promise
                .then(data => {
                    this.setState({ 
                        detailData: data, 
                        loading: false,
                        error: null 
                    });
                })
                .catch(err => {
                    console.log('Error loading data:', err);
                    this.setState({ 
                        detailData: {}, 
                        loading: false,
                        error: err.message || 'Ошибка загрузки данных'
                    });
                });
        }
        this.setState({ data: props.property });
    }

    renderViolationsContent = () => {
        const { detailData } = this.state;
        if (!detailData) return null;

        return (
            <div>
                <div className="mb-3">
                    <strong>Всего нарушений: {detailData.totalViolations || 0}</strong>
                </div>
                <hr />
                <div 
                    className="violations-list" 
                    style={{ maxHeight: '400px', overflowY: 'auto' }}
                >
                    {detailData.violations && detailData.violations.length > 0 ? (
                        detailData.violations.map((violation, index) => (
                            <div key={index} className="violation-entry mb-3" style={{
                                borderLeft: '3px solid #007bff',
                                paddingLeft: '10px',
                                marginBottom: '15px'
                            }}>
                                <span>
                                    <span>{violation.date}</span> {violation.subdivision} - {violation.item && violation.item.length > 40 ? violation.item.substring(0, 30) + '...' : violation.item} Факт балл: {violation.fact}
                                </span>
                                <div>
                                    {violation.photos && violation.photos.length > 0 && (
                                    <span>
                                        <span className="text-info"></span>{' '}
                                        {violation.photos.map((photo, photoIndex) => (
                                            <a
                                                key={photoIndex}
                                                href={photo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-primary me-1"
                                                style={{
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    marginRight: '4px'
                                                }}
                                            >
                                                фото {photoIndex + 1}
                                            </a>
                                        ))}
                                    </span>
                                )}
                                    <span>
                                        <span>{violation.photos?.length ? ' - ' : 'Причина: '}</span> {violation.reason}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div></div>
                    )}
                </div>
            </div>
        );
    };

    renderScoreContent = () => {
        const { detailData } = this.state;
        if (!detailData) return null;

        return (
            <div>
                <div>Факт балл: {detailData.actualScore || 0}</div>
                <div>План балл: {detailData.plannedScore || 0}</div>
                <div>Отклонение: {detailData.deviation || 0}</div>
                <div>Процент выполнения: {detailData.completionPercent || 0}%</div>
                {detailData.scoreDetails && (
                    <div>
                        <hr />
                        <div><strong>Детализация баллов:</strong></div>
                        {Object.entries(detailData.scoreDetails).map(([key, value]) => (
                            <div key={key}>
                                <small>{key}: {value}</small>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    getPopoverTitle = () => {
        const { data } = this.state;
        if (!data || !data.columnType) return 'Детали';
        
        switch (data.columnType) {
            case 'violations':
                return 'Детали нарушений';
            case 'score':
                return 'Детали баллов';
            default:
                return 'Детали';
        }
    };

    renderContent = () => {
        const { data } = this.state;
        
        // For testing: show basic cell info if no specific column type
        if (!data) {
            return <div>Нет данных о ячейке</div>;
        }

        if (!data.columnType) {
            return (
                <div>
                    <div>Колонка: {data.columnName || 'Неизвестно'}</div>
                    <div>Значение: {data.cellValue || 'Нет значения'}</div>
                    <div>Тип колонки не поддерживается</div>
                </div>
            );
        }

        switch (data.columnType) {
            case 'violations':
                return this.renderViolationsContent();
            case 'score':
                return this.renderScoreContent();
            default:
                return <div>Нет данных для отображения</div>;
        }
    };

    render() {
        const { cellId, isOpen } = this.props;
        const { loading, error } = this.state;

        return (
            <div>
                {cellId && isOpen && (
                    <Popover
                        placement="left"
                        isOpen={isOpen}
                        target={cellId}
                        toggle={this.props.toggle}
                        trigger="legacy" 

                         style={{ minHeight: '200px' }}
                    >
                        <PopoverHeader>{this.getPopoverTitle()}</PopoverHeader>
                        <PopoverBody>
                            {error ? (
                                <div className="text-danger">
                                    Ошибка: {error}
                                </div>
                            ) : (
                                <LoadingWrappedView loading={loading} height="160px">
                                    <div style={{
                                        fontSize: '12px',
                                        lineHeight: '1.4'
                                    }}>
                                        {this.renderContent()}
                                    </div>
                                </LoadingWrappedView>
                            )}
                        </PopoverBody>
                    </Popover>
                )}
            </div>
        );
    }
}

export default ChecklistCellDetailWindow;