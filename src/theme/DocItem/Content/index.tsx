/**
 * Wraps the stock doc content to add the "Copy page" control. It renders
 * just before the content, inside the same <article>, so it floats beside
 * the page title; the original component is left untouched.
 */
import type {ReactNode} from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';
import CopyPage from '@site/src/components/CopyPage';

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): ReactNode {
  return (
    <>
      <CopyPage />
      <Content {...props} />
    </>
  );
}
