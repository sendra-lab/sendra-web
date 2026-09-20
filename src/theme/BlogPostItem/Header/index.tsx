/**
 * Wraps the stock blog post header to add the "Copy page" control on post
 * pages (not in the blog list, where many posts share one page). It renders
 * just before the header, so it floats beside the post title.
 */
import {useContext, type ReactNode} from 'react';
import Header from '@theme-original/BlogPostItem/Header';
import type HeaderType from '@theme/BlogPostItem/Header';
import type {WrapperProps} from '@docusaurus/types';
import CopyPage from '@site/src/components/CopyPage';
import {BlogPostPageContext} from '@site/src/components/CopyPage/BlogPostPageContext';

type Props = WrapperProps<typeof HeaderType>;

export default function HeaderWrapper(props: Props): ReactNode {
  const isBlogPostPage = useContext(BlogPostPageContext);
  return (
    <>
      {isBlogPostPage && <CopyPage />}
      <Header {...props} />
    </>
  );
}
