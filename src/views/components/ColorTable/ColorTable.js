import React, { Component, Fragment } from 'react';
import './style.css';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';

class ColorTable extends Component {
    state = {
        cellId: null,
        expandedRows: [],
        loadingRows: [],
    };

    componentDidUpdate() {
        this.props.onCng(this.state.expandedRows);
    }

    handleCellClick = e => {
        let cellId = e.target.id;
        // this.setState({
        //   cellId: cellId
        // });
        if (this.props.onCellClick) {
            this.props.onCellClick(cellId);
        }
    };

    // expandable properties \/

    detailMap = new Map();

    isExpandable = () => {
        return this.props.onExpand !== undefined;
    };

    handleExpand = (rowInd, onlyUpdate = false) => {
        let newExpandedRows = [...this.state.expandedRows];
        let idxFound = newExpandedRows.findIndex(id => {
            return id === rowInd;
        });

        if (idxFound > -1 && !onlyUpdate) {
            newExpandedRows.splice(idxFound, 1);
        } else {
            if (idxFound === -1) newExpandedRows.push(rowInd);
            if (!this.detailMap.has(rowInd)) {
                this.getDetailRows(rowInd);
            }
        }

        this.updated = Date.now();
        this.setState({ expandedRows: [...newExpandedRows] });
        //this.props.onCng(this.state.expandedRows);
    };

    getDetailRows = rowInd => {
        this.props
            .onExpand(rowInd)
            .then(detailData => {
                this.detailMap.set(rowInd, detailData);
                this.handleExpand(rowInd, true);
            })
            .catch(e => {
                this.props.onError('Ошибка загрузки детализации: ' + e);
                this.detailMap.set(rowInd, 'ошибка');
                this.handleExpand(rowInd, true);
            });
    };

    isExpanded = rowInd => {
        const idx = this.state.expandedRows.find(id => {
            return id === rowInd;
        });

        return idx > -1;
    };

    expandLoading = (
        <div className="text-center">
            <div
                className="spinner-border text-info"
                style={{
                    height: '1rem',
                    width: '1rem',
                    borderBottomWidth: '0.15em',
                    borderTopWidth: '0.15em',
                    borderLeftWidth: '0.15em',
                    borderRightWidth: '0.15em',
                }}
            />
        </div>
    );

    getTooltip = cell => {
        return cell.tooltip ? (
            <UncontrolledTooltip
                placement="bottom"
                style={
                    cell.background && {
                        background: cell.background,
                    }
                }
                target={cell.cellId}
            >
                {cell.tooltip}
            </UncontrolledTooltip>
        ) : null;
    };

    getRows = (row, rowIndex) => {
        let rows = [];

        const firstRow = (
            <tr key={rowIndex}>
                {this.isExpandable() && (
                    <td
                        className={
                            'cell-expand-button ' +
                            (row.isTotal ? 'cell-total' : '')
                        }
                        width="30px"
                    >
                        {/*<button  onClick={()=>this.handleExpand(rowIndex)}>*/}
                        {this.isExpanded(rowIndex) &&
                        !this.detailMap.has(rowIndex) ? (
                            this.expandLoading
                        ) : (
                            <a
                                className="btn btn-minimize"
                                onClick={() => this.handleExpand(rowIndex)}
                            >
                                <i
                                    className={
                                        this.isExpanded(rowIndex)
                                            ? 'icon-arrow-down'
                                            : 'icon-arrow-right'
                                    }
                                />
                            </a>
                        )}

                        {/*</button>*/}
                    </td>
                )}
                {row
                    .filter(x => !x.hidden)
                    .map((col, index) => (
                        <td
                            id={col.cellId}
                            className={
                                'cell-cone ' +
                                (col.row.isTotal ? 'cell-total ' : '') +
                                (col.cellId && this.props.cellId === col.cellId
                                    ? 'focus '
                                    : '') +
                                (col.clickProperty ? 'clickable' : '')
                            }
                            style={{
                                background: col.background,
                                maxWidth: col.maxWidth,
                                overflow: col.maxWidth && 'hidden',
                                ...styles.tableCell,
                                ...(index >= this.props.valueColumnsOffset
                                    ? styles.tableCellValue
                                    : {}),
                            }}
                            key={col.cellId}
                            onClick={col.clickProperty ? this.handleCellClick : undefined}
                        >
                            {col.label}
                            {this.getTooltip(col)}
                        </td>
                    ))}
            </tr>
        );

        rows.push(firstRow);

        if (this.isExpanded(rowIndex)) {
            const detailData = this.detailMap.get(rowIndex);
            if (detailData) {
                if (typeof detailData === 'string') {
                    rows.push(
                        <tr key={rowIndex * 1000}>
                            <td>
                                <br />
                            </td>
                            <td className="text-danger">{detailData}</td>
                        </tr>
                    );
                    return rows;
                } //todo
                const detailRow = detailData.rows.map((rowD, rowIndexD) => (
                    <tr key={rowIndex * 1000 + rowIndexD}>
                        <td className="cell-expand-button cell-expanded-empty">
                            <br />
                        </td>
                        {rowD
                            .filter(x => !x.hidden)
                            .map((col, index) => (
                                <td
                                    id={col.cellId}
                                    className={`cell-cone cell-detail ${col.clickProperty ? 'clickable' : ''}`}
                                    style={{
                                        background: col.background,
                                        ...styles.tableCell,
                                    }}
                                    key={`dcell${rowIndex}_${index}`}
                                    onClick={col.clickProperty ? this.handleCellClick : undefined}
                                >
                                    {col.label}
                                    {this.getTooltip(col)}
                                </td>
                            ))}
                    </tr>
                ));
                rows.push(detailRow);
            }
        }

        return rows;
    };

    // expandable properties /\

    render() {
        return (
            <table className="table table-bordered table-sm cell-cone">
                <thead>
                    <tr>
                        {this.isExpandable() && (
                            <th className="cell-expand-button" />
                        )}
                        {this.props.data &&
                            this.props.data.headerColumns
                                .filter(x => !x.hidden)
                                .map((item, index) => {
                                    return (
                                        <th
                                            key={index}
                                            style={{
                                                background: item.background,
                                            }}
                                        >
                                            <div>
                                                {' '}
                                                {/* todo move from here to FrozenTable component */}
                                                {item.label}
                                            </div>
                                        </th>
                                    );
                                })}
                    </tr>
                </thead>

                <tbody>
                    {this.props.data &&
                        this.props.data.rows.map((row, rowIndex) =>
                            this.getRows(row, rowIndex)
                        )}
                </tbody>
            </table>
        );
    }
}

ColorTable.propTypes = {
    data: PropTypes.object.isRequired,
    valueColumnsOffset: PropTypes.number,
    onExpand: PropTypes.func,
    onError: PropTypes.func,
};

ColorTable.defaultProps = {
    valueColumnsOffset: 1,
    onError: () => {},
};

const styles = {
    tableCell: {
        whiteSpace: 'nowrap',
    },
    tableCellValue: {
        textAlign: 'center',
    },
};

export default ColorTable;
