/**
 * Interface for a Wiki Page
 * @see https://osu.ppy.sh/docs/index.html#wikipage
 */
export interface WikiPage {
    /**
     * All available locales for the article.
     */
    available_locales: string[];

    /**
     * The layout type for the page.
     */
    layout: string;

    /**
     * All lowercase BCP 47 language tag.
     */
    locale: string;

    /**
     * Markdown content.
     */
    markdown: string;

    /**
     * Path of the article.
     */
    path: string;

    /**
     * The article's subtitle.
     */
    subtitle?: string;

    /**
     * Associated tags for the article.
     */
    tags: string[];

    /**
     * The article's title.
     */
    title: string;
}

/**
 * Interface for a Wiki Page Response
 */
export interface WikiPageResponse {
    /** The API response's status code */
    status: number;

    /** The API response's data */
    data: WikiPage;
}
