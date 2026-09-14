/**
 * Swizzled replacement for the default color-mode toggle: a single button
 * that silently cycles system -> light -> dark -> system with no visible
 * labels. This renders the same three choices as an explicit dropdown menu
 * instead, so "system" is discoverable rather than a state you stumble into.
 * Relies entirely on Docusaurus's own `useColorMode`-backed props
 * (`value`/`onChange`) passed down from `@theme/Navbar/ColorModeToggle` —
 * no color-mode storage/logic is reimplemented here.
 */
import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {translate} from '@docusaurus/Translate';
import IconLightMode from '@theme/Icon/LightMode';
import IconDarkMode from '@theme/Icon/DarkMode';
import IconSystemColorMode from '@theme/Icon/SystemColorMode';
import type {Props} from '@theme/ColorModeToggle';
import {changeColorModeWithTransition} from '../colorModeTransition';
import styles from './styles.module.css';

type Choice = Props['value'];

type IconComponent = (props: {className?: string}) => ReactNode;

const OPTIONS: Array<{choice: Choice; label: string; Icon: IconComponent}> = [
  {
    choice: null,
    label: translate({
      message: 'System',
      id: 'theme.colorToggle.choice.system',
      description: 'Dropdown option: follow the OS color scheme',
    }),
    Icon: IconSystemColorMode,
  },
  {
    choice: 'light',
    label: translate({
      message: 'Light',
      id: 'theme.colorToggle.choice.light',
      description: 'Dropdown option: force light mode',
    }),
    Icon: IconLightMode,
  },
  {
    choice: 'dark',
    label: translate({
      message: 'Dark',
      id: 'theme.colorToggle.choice.dark',
      description: 'Dropdown option: force dark mode',
    }),
    Icon: IconDarkMode,
  },
];

function CurrentIcon({choice}: {choice: Choice}): ReactNode {
  const option = OPTIONS.find((o) => o.choice === choice) ?? OPTIONS[0]!;
  const {Icon} = option;
  return <Icon className={styles.currentIcon} />;
}

export default function ColorModeToggle({
  className,
  buttonClassName,
  value,
  onChange,
}: Props): ReactNode {
  const isBrowser = useIsBrowser();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, close]);

  return (
    <div className={clsx(styles.container, className)} ref={rootRef}>
      <button
        type="button"
        className={clsx('clean-btn', styles.trigger, buttonClassName)}
        disabled={!isBrowser}
        aria-haspopup="menu"
        aria-expanded={open}
        title={translate({
          message: 'Color mode',
          id: 'theme.colorToggle.ariaLabel',
          description: 'Title/aria-label for the color mode dropdown trigger',
        })}
        onClick={() => setOpen((prev) => !prev)}>
        <CurrentIcon choice={value} />
        <svg
          className={styles.chevron}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          aria-hidden="true">
          <path
            d="M1 1l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <ul className={styles.menu} role="menu">
          {OPTIONS.map(({choice, label, Icon}) => (
            <li key={label} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={value === choice}
                className={clsx(
                  styles.menuItem,
                  value === choice && styles.menuItemActive,
                )}
                onClick={(event) => {
                  const origin = {x: event.clientX, y: event.clientY};
                  changeColorModeWithTransition(() => onChange(choice), origin);
                  close();
                }}>
                <Icon className={styles.menuIcon} />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
