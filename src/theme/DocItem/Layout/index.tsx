import type {ReactNode} from 'react';
import clsx from 'clsx';
import {useLocation} from '@docusaurus/router';
import DocItemLayout from '@theme-original/DocItem/Layout';
import type DocItemLayoutType from '@theme/DocItem/Layout';
import type {WrapperProps} from '@docusaurus/types';
import DocItemContent from '@theme/DocItem/Content';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from '@theme/DocItem/Footer';
import DocItemPaginator from '@theme/DocItem/Paginator';
import {DocsHomeContents} from '@site/src/components/DocsHome';
import styles from './styles.module.css';

type Props = WrapperProps<typeof DocItemLayoutType>;

export default function DocItemLayoutWrapper({children}: Props): ReactNode {
  const {pathname} = useLocation();
  const isIntroduction = pathname.replace(/\/$/, '') === '/docs/intro';

  if (!isIntroduction) {
    return <DocItemLayout>{children}</DocItemLayout>;
  }

  return (
    <div className="row">
      <div className={clsx('col', styles.docItemCol)}>
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />
            <div className={styles.homeContentsMobile}>
              <DocsHomeContents />
            </div>
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>
      </div>
      <div className={clsx('col col--3', styles.homeContentsDesktop)}>
        <DocsHomeContents />
      </div>
    </div>
  );
}
