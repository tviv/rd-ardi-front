import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {};

class DefaultFooter extends Component {
    render() {
        // eslint-disable-next-line
        const { children, ...attributes } = this.props;

        return (
            <React.Fragment>
                <span>
                    <a href="">Ardi</a> &copy; 2018-2020 раз-два.
                </span>
                {/*<span className="ml-auto">Powered by <a href="">CoreUI for React</a></span>*/}
            </React.Fragment>
        );
    }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;
