/**
 * Wraps the stock blog post page only to mark its subtree as "a single
 * post page" for the "Copy page" control in BlogPostItem/Header.
 */
import type {ReactNode} from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
import type BlogPostPageType from '@theme/BlogPostPage';
import type {WrapperProps} from '@docusaurus/types';
import {BlogPostPageContext} from '@site/src/components/CopyPage/BlogPostPageContext';

type Props = WrapperProps<typeof BlogPostPageType>;

export default function BlogPostPageWrapper(props: Props): ReactNode {
  return (
    <BlogPostPageContext.Provider value>
      <BlogPostPage {...props} />
    </BlogPostPageContext.Provider>
  );
}
