import { Switch as HeadlessSwitch } from '@headlessui/react';
import clsx from 'clsx';

export function Switch({ checked, onChange }) {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20',
        checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
      )}
    >
      <span
        className={clsx(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </HeadlessSwitch>
  );
}