import React from 'react';
import './index.less';

interface NavigationBarProps {
  onOptionSelect?: (optionId: string) => void;
  idPrefix: string;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  onOptionSelect,
  idPrefix,
}) => {
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onOptionSelect) {
      onOptionSelect(e.target.id);
    }
  };

  return (
    <div className="nav">
      <input
        type="radio"
        name="nav"
        id="nav-item-opt-all" //id={'${idPrefix}-nav-item-opt-all'}
        defaultChecked
        onChange={handleOptionChange}
      />
      <label htmlFor="nav-item-opt-all" className="nav-item">
        全部
      </label>

      <input
        type="radio"
        name="nav"
        id="nav-item-opt-1"
        onChange={handleOptionChange}
      />
      <label htmlFor="nav-item-opt-1" className="nav-item">
        hz
      </label>

      <input
        type="radio"
        name="nav"
        id="nav-item-opt-2"
        onChange={handleOptionChange}
      />
      <label htmlFor="nav-item-opt-2" className="nav-item">
        victor
      </label>

      <input
        type="radio"
        name="nav"
        id="nav-item-opt-3"
        onChange={handleOptionChange}
      />
      <label htmlFor="nav-item-opt-3" className="nav-item">
        xtl
      </label>
      <div className="tracker"></div>
    </div>
  );
};

export default NavigationBar;
