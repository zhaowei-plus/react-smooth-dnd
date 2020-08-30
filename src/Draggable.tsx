import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { constants } from 'smooth-dnd';
const { wrapperClass } = constants;

export interface DraggableProps {
	render?: () => React.ReactElement;
	className?: string;
}

class Draggable extends Component<DraggableProps> {
	public static propsTypes = {
		render: PropTypes.func,
		className: PropTypes.string,
	}

	render() {
		const { render, className } = this.props
		// 自定义的render方法
		if (render) {
			return React.cloneElement(render(), { className: wrapperClass });
		}

		const clsName = `${className ? (className + ' ') : ''}`
		return (
			<div
				{...this.props}
				className={`${clsName}${wrapperClass}`}
			>
				{this.props.children}
			</div>
		);
	}
}

export default Draggable;
