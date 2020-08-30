import React, { Component, CSSProperties } from 'react';
import PropTypes from 'prop-types';
import { smoothDnD as container, ContainerOptions, SmoothDnD } from 'smooth-dnd';
import { dropHandlers } from 'smooth-dnd';

container.dropHandler = dropHandlers.reactDropHandler().handler;
container.wrapChild = false;

interface ContainerProps extends ContainerOptions {
  render?: (rootRef: React.RefObject<any>) => React.ReactElement;
  style?: CSSProperties;
}

class Container extends Component<ContainerProps> {
  // 默认属性
  public static propTypes = {
    behaviour: PropTypes.oneOf(['move', 'copy', 'drop-zone', 'contain']),
    groupName: PropTypes.string,
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),
    style: PropTypes.object,
    dragHandleSelector: PropTypes.string,
    nonDragAreaSelector: PropTypes.string,
    dragBeginDelay: PropTypes.number,
    animationDuration: PropTypes.number,
    autoScrollEnabled: PropTypes.bool,
    lockAxis: PropTypes.string,
    dragClass: PropTypes.string,
    dropClass: PropTypes.string,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func,
    onDrop: PropTypes.func,
    getChildPayload: PropTypes.func,
    shouldAnimateDrop: PropTypes.func,
    shouldAcceptDrop: PropTypes.func,
    onDragEnter: PropTypes.func,
    onDragLeave: PropTypes.func,
    render: PropTypes.func,
    getGhostParent: PropTypes.func,
    removeOnDropOut: PropTypes.bool,
    dropPlaceholder: PropTypes.oneOfType([
      PropTypes.shape({
        className: PropTypes.string,
        animationDuration: PropTypes.number,
        showOnTop: PropTypes.bool,
      }),
      PropTypes.bool,
    ]),
  };

  public static defaultProps = {
    behaviour: 'move',
    orientation: 'vertical',
  };

  prevContainer: null;
  container: SmoothDnD = null!;
  containerRef: React.RefObject<any> = React.createRef();

  constructor(props: ContainerProps) {
    super(props);

    this.prevContainer = null;

    this.getContainerOptions = this.getContainerOptions.bind(this);
    this.getContainer = this.getContainer.bind(this);
    this.isObjectTypePropsChanged = this.isObjectTypePropsChanged.bind(this);
  }

  componentDidMount() {
    // 记录 container Dom 元素
    this.prevContainer = this.getContainer();

    // 记录 smooth-dnd 渲染之后的 Dom
    this.container = container(this.getContainer(), this.getContainerOptions());
  }

  componentDidUpdate(prevProps: ContainerProps) {
    if (this.getContainer()) {
      // 更新数据
      if (this.prevContainer && this.prevContainer !== this.getContainer()) {
        this.container.dispose();

        // 冲渲染区域
        this.container = container(this.getContainer(), this.getContainerOptions());
        this.prevContainer = this.getContainer();
        return;
      }

      if (this.isObjectTypePropsChanged(prevProps)) {
        this.container.setOptions(this.getContainerOptions())
      }
    }
  }


  componentWillUnmount() {
    this.container.dispose();
    this.container = null!;
  }


  // 判断属性是否发生改变，不包括 函数
  isObjectTypePropsChanged(prevProps: ContainerProps) {
    const { render, children, style, ...containerOptions } = this.props;

    for (const _key in containerOptions) {
      const key = _key as keyof ContainerOptions;
      if (containerOptions.hasOwnProperty(key)) {
        const prop = containerOptions[key];

        if (typeof prop !== 'function' && prop !== prevProps[key]) {
          return true;
        }
      }
    }

    return false;
  }


  // 获取 container Dom 元素
  getContainer() {
    return this.containerRef.current;
  }

  // 复制 this.props
  getContainerOptions(): ContainerOptions {
    return Object.keys(this.props)
      .reduce((result: ContainerOptions, key: string) => {
        /*
        * keyof ContainerOptions用于火毒类型的所有键，其返回类型是联合类型
        * interface Person {
  name: string;
  age: number;
  location: string;
}

type K1 = keyof Person; // "name" | "age" | "location"
        * */
        const optionName = key as keyof ContainerOptions; // 类型定义：表示 key 是 keyof ContainerOptions 类型
        const prop = this.props[optionName];

        if (typeof prop === 'function') {
          // 拷贝这个函数
          result[optionName] = (...params: any[]) => {
            return (this.props[optionName] as Function)(...params);
          }
        } else {
          result[optionName] = prop;
        }

        return result;
      },{}) as ContainerOptions;
  }

  render() {
    const { render, style, children } = this.props

    if (render) {
      // 渲染Dom 节点
      return render(this.containerRef);
    }

    return (
      <div style={style} ref={this.containerRef}>
        {children}
      </div>
    )
  }

}

export default Container;
