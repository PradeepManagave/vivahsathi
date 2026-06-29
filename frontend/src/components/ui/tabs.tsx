import React, { useState, createContext, useContext } from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType>({
  activeTab: '',
  setActiveTab: () => {},
});

export interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  default: 'border-b border-surface-200',
  pills: 'bg-surface-100 p-1 rounded-lg',
  underline: 'border-b border-surface-200',
};

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultValue,
  value,
  onChange,
  variant = 'default',
  className = '',
  children,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || tabs[0]?.id || '');
  const activeTab = value ?? internalValue;

  const setActiveTab = (id: string) => {
    if (value === undefined) {
      setInternalValue(id);
    }
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>
        <div className={`flex gap-1 ${variantClasses[variant]}`} role="tablist">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const baseClasses = 'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-lg';
            const activeClasses =
              variant === 'pills'
                ? 'bg-white text-primary shadow-sm'
                : variant === 'underline'
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'text-primary bg-primary-50';
            const inactiveClasses =
              variant === 'pills'
                ? 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                : 'text-stone-500 hover:text-stone-700 hover:bg-surface-100';

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${
                  tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-surface-200 text-stone-600">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export interface TabPanelProps {
  tabId: string;
  children: React.ReactNode;
  className?: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ tabId, children, className = '' }) => {
  const { activeTab } = useContext(TabsContext);

  if (tabId !== activeTab) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${tabId}`}
      className={`py-4 animate-fade-in ${className}`}
    >
      {children}
    </div>
  );
};

export { Tabs, TabPanel };
