import type {ReactNode} from 'react';
import TOCDesktop from '@theme-original/DocItem/TOC/Desktop';
import styles from './styles.module.css';

export default function DocItemTOCDesktop(): ReactNode {
  return (
    <nav className={styles.tocRail} aria-label="Page contents">
      <strong>On this page</strong>
      <TOCDesktop />
    </nav>
  );
}
