import type {ReactNode} from 'react';
import clsx from 'clsx';
import {useLocation} from '@docusaurus/router';
import type BlogLayoutType from '@theme/BlogLayout';
import type {WrapperProps} from '@docusaurus/types';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import styles from '../BlogListPage/styles.module.css';

type Props = WrapperProps<typeof BlogLayoutType>;

export default function BlogLayoutWrapper(props: Props): ReactNode {
  const {pathname} = useLocation();
  const {sidebar, toc, children, ...layoutProps} = props;
  const hasSidebar = Boolean(sidebar?.items.length);
  const isBlogIndex = pathname.replace(/\/$/, '') === '/blog';

  return (
    <Layout {...layoutProps}>
      {isBlogIndex && (
        <header className={styles.intro}>
          <div className="container">
            <div className={styles.introContent}>
              <div>
                <span className={styles.eyebrow}>THE SENDRA JOURNAL</span>
                <h1>Notes from the request line.</h1>
                <p>
                  Product updates, engineering notes, and ideas for a better way
                  to work with APIs.
                </p>
              </div>
            </div>
          </div>
        </header>
      )}
      <div className="container margin-vert--lg">
        <div className="row">
          <BlogSidebar sidebar={sidebar} />
          <main className={clsx('col', {
            'col--7': hasSidebar,
            'col--9 col--offset-1': !hasSidebar,
          })}>
            {children}
          </main>
          {toc && <div className="col col--2">{toc}</div>}
        </div>
      </div>
    </Layout>
  );
}
