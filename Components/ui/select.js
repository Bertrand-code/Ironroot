import React from 'react';

const SelectContext = React.createContext(null);

const getItems = (children) => {
  const items = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === SelectContent) {
      React.Children.forEach(child.props.children, (item) => {
        if (React.isValidElement(item) && item.type === SelectItem) {
          items.push({ value: item.props.value, label: item.props.children });
        }
      });
    }
  });
  return items;
};

const getPlaceholder = (children) => {
  let placeholder = '';
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === SelectTrigger) {
      React.Children.forEach(child.props.children, (inner) => {
        if (React.isValidElement(inner) && inner.type === SelectValue) {
          placeholder = inner.props.placeholder || '';
        }
      });
    }
  });
  return placeholder;
};

export function Select({ value, onValueChange, children, className = '', ...props }) {
  const items = getItems(children);
  const placeholder = getPlaceholder(children);
  const triggerClass = (() => {
    let found = '';
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.type === SelectTrigger) {
        found = child.props.className || '';
      }
    });
    return found;
  })();
  return (
    <div className={className}>
      <select
        className={`select ${triggerClass}`.trim()}
        value={value || ''}
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <SelectContext.Provider value={null}>{children}</SelectContext.Provider>
    </div>
  );
}

export function SelectTrigger({ children }) {
  return <>{children}</>;
}

export function SelectValue() {
  return null;
}

export function SelectContent({ children }) {
  return <>{children}</>;
}

export function SelectItem() {
  return null;
}
