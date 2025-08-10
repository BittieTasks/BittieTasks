import React from 'react';
import { Link, useLocation } from 'wouter';
import { ARIA_LABELS } from '@/lib/accessibility';

const KEYBOARD_KEYS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End'
};

interface NavItem {
  path: string;
  label: string;
  ariaLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface AccessibleNavProps {
  items: NavItem[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  ariaLabel?: string;
}

export const AccessibleNav: React.FC<AccessibleNavProps> = ({
  items,
  className = '',
  orientation = 'horizontal',
  ariaLabel = 'Navigation menu'
}) => {
  const [location] = useLocation();
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const navRef = React.useRef<HTMLElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    
    switch (e.key) {
      case KEYBOARD_KEYS.ARROW_RIGHT:
        if (orientation === 'horizontal') {
          e.preventDefault();
          newIndex = (index + 1) % items.length;
        }
        break;
      case KEYBOARD_KEYS.ARROW_LEFT:
        if (orientation === 'horizontal') {
          e.preventDefault();
          newIndex = index === 0 ? items.length - 1 : index - 1;
        }
        break;
      case KEYBOARD_KEYS.ARROW_DOWN:
        if (orientation === 'vertical') {
          e.preventDefault();
          newIndex = (index + 1) % items.length;
        }
        break;
      case KEYBOARD_KEYS.ARROW_UP:
        if (orientation === 'vertical') {
          e.preventDefault();
          newIndex = index === 0 ? items.length - 1 : index - 1;
        }
        break;
      case KEYBOARD_KEYS.HOME:
        e.preventDefault();
        newIndex = 0;
        break;
      case KEYBOARD_KEYS.END:
        e.preventDefault();
        newIndex = items.length - 1;
        break;
    }

    if (newIndex !== index) {
      setFocusedIndex(newIndex);
      const links = navRef.current?.querySelectorAll('a');
      if (links && links[newIndex]) {
        links[newIndex].focus();
      }
    }
  };

  const isHorizontal = orientation === 'horizontal';

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label={ariaLabel}
      className={`${className}`}
    >
      <ul 
        className={`${
          isHorizontal 
            ? 'flex items-center space-x-4' 
            : 'flex flex-col space-y-2'
        }`}
        role="menubar"
        aria-orientation={orientation}
      >
        {items.map((item, index) => {
          const isActive = location === item.path || 
            (item.path !== '/' && location.startsWith(item.path));
          
          return (
            <li key={item.path} role="none">
              <Link
                href={item.path}
                role="menuitem"
                aria-label={item.ariaLabel || `Navigate to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  block px-3 py-2 rounded-md transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }
                `}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(-1)}
              >
                <div className="flex items-center space-x-2">
                  {item.icon && (
                    <item.icon 
                      className="h-4 w-4" 
                      aria-hidden="true" 
                    />
                  )}
                  <span>{item.label}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};