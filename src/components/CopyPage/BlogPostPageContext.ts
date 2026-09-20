import {createContext} from 'react';

/**
 * True inside a single blog post page, false in list/tag/archive views.
 * The post header component is shared by all of those and can't tell them
 * apart itself, without importing the blog plugin's client hooks (which
 * this pnpm project doesn't declare as direct dependencies).
 */
export const BlogPostPageContext = createContext(false);
