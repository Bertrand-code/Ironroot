import React from 'react';

const TabsContext = React.createContext({ value: '', setValue: () => {} });

export function Tabs({ value: controlledValue, defaultValue, onValueChange, children, className = '' }) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || '');
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const setValue = (next) => {
    if (controlledValue === undefined) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', ...props }) {
  return <div className={`tabs ${className}`.trim()} {...props} />;
}

export function TabsTrigger({ value, className = '', ...props }) {
  const { value: active, setValue } = React.useContext(TabsContext);
  const isActive = active === value;
  return (
    <button
      type="button"
      data-state={isActive ? 'active' : 'inactive'}
      className={`tab-trigger ${className}`.trim()}
      onClick={() => setValue(value)}
      {...props}
    />
  );
}

export function TabsContent({ value, className = '', ...props }) {
  const { value: active } = React.useContext(TabsContext);
  if (active !== value) return null;
  return <div className={className} {...props} />;
}
