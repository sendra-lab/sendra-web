import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import BlogListPage from '@theme-original/BlogListPage';
import type BlogListPageType from '@theme/BlogListPage';
import type {WrapperProps} from '@docusaurus/types';
import styles from './styles.module.css';

type Props = WrapperProps<typeof BlogListPageType>;

export default function BlogListPageWrapper(props: Props): ReactNode {
  return (
    <>
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
            <Link className={styles.feedLink} to="/blog/rss.xml" aria-label="Subscribe to the Sendra blog RSS feed">
              <span aria-hidden="true">↗</span> RSS feed
            </Link>
          </div>
        </div>
      </header>
      <BlogListPage {...props} />
    </>
  );
}
