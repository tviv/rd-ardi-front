import React from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';
import './style.css';

//import { FormControl } from 'react-bootstrap'; //todo temporally - or remove reactstrap

class RangeDatePicker extends React.Component {
    constructor(props) {
        super(props);
        let now = new Date();
        let start = props.startDate || moment().startOf('month');
        let end = props.endDate || moment().endOf('month');
        this.state = {
            start: start,
            end: end,
        };
    }

    ranges = {
        'Текущий месяц': [moment().startOf('month'), moment().endOf('month')],
        'Прошлый месяц': [
            moment()
                .subtract(1, 'month')
                .startOf('month'),
            moment()
                .subtract(1, 'month')
                .endOf('month'),
        ],
        Неделя: [
            moment()
                .subtract(0, 'day')
                .subtract(7, 'day'),
            moment().subtract(1, 'day'),
        ],
        Месяц: [
            moment()
                .subtract(0, 'day')
                .subtract(1, 'month'),
            moment().subtract(1, 'day'),
        ],
        'Три месяца': [
            moment()
                .subtract(0, 'day')
                .subtract(3, 'month'),
            moment().subtract(1, 'day'),
        ],
    };

    //todo something universal/auto
    locale = {
        format: 'DD.MM.YYYY',
        customRangeLabel: 'Пользовательский',
        weekLabel: 'Н',
        daysOfWeek: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        monthNames: [
            'Январь',
            'Февраль',
            'Март',
            'Апрель',
            'Май',
            'Июнь',
            'Июль',
            'Август',
            'Сентябрь',
            'Октябрь',
            'Ноябрь',
            'Декабрь',
        ],
        firstDay: 1,
    };
    maxDate = moment().endOf('month');

    onDatesChange = (event, { startDate, endDate }) => {
        this.setState({
            start: startDate,
            end: endDate,
        });
        this.props.onChange(
            startDate.format('YYYY-MM-DD'),
            endDate.format('YYYY-MM-DD')
        );
    };

    render() {
        let value = `${this.state.start.format(
            'DD.MM.YYYY'
        )} - ${this.state.end.format('DD.MM.YYYY')}`;

        return (
            <DateRangePicker
                ranges={this.ranges}
                start={this.state.start}
                end={this.state.end}
                locale={this.locale}
                maxDate={this.maxDate}
                autoApply={true}
                alwaysShowCalendars
                onApply={this.onDatesChange}
            >
                <input
                    id="formControlsTextB"
                    type="text"
                    label="Text"
                    placeholder="Enter text"
                    className="form-control"
                    readOnly={true}
                    style={{ cursor: 'pointer', backgroundColor: 'white' }}
                    value={value}
                />
            </DateRangePicker>
        );
    }
}

RangeDatePicker.propsType = {
    startDate: PropTypes.object.isRequired,
    endDate: PropTypes.object.isRequired,
    onChange: PropTypes.func,
};

RangeDatePicker.defaultProps = {
    onChange: () => {},
};

export default RangeDatePicker;
