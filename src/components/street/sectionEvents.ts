import { createContext } from 'react';

/** True inside the street's open-building panel, which supplies the id and title. */
export const InPanel = createContext(false);

/** Tab bar → street: open this building. */
export const OPEN_SECTION_EVENT = 'open-section';
/** Street → tab bar: this building is now open. */
export const SECTION_OPENED_EVENT = 'section-opened';

export function openSection(id: string) {
  window.dispatchEvent(new CustomEvent(OPEN_SECTION_EVENT, { detail: id }));
}
