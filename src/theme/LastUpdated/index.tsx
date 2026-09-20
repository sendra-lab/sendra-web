/**
 * Wraps the stock "Last updated on <date> by <author>" line so the author is
 * always the site's author, linked to their GitHub profile, instead of
 * whatever name git recorded for the last commit (this repo's history has
 * more than one name for the same person, and synced docs have no git
 * author at all).
 *
 * The original component only shows an author when it's given one, so the
 * link is passed in its place; it renders it inside its own <b>.
 */
import type {ReactNode} from 'react';
import LastUpdated from '@theme-original/LastUpdated';
import type LastUpdatedType from '@theme/LastUpdated';
import type {WrapperProps} from '@docusaurus/types';
import Link from '@docusaurus/Link';

type Props = WrapperProps<typeof LastUpdatedType>;

const AUTHOR_NAME = 'Oyibe Chidubem';
const AUTHOR_GITHUB_URL = 'https://github.com/dubemoyibe-star';

export default function LastUpdatedWrapper(props: Props): ReactNode {
  const author = (
    <Link to={AUTHOR_GITHUB_URL} title="GitHub profile">
      {AUTHOR_NAME}
    </Link>
  );
  return (
    <LastUpdated
      {...props}
      // Typed as `string`, but the component only interpolates it into JSX.
      lastUpdatedBy={author as unknown as string}
    />
  );
}
