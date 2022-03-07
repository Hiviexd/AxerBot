export interface OAuthAccessToken {
    /**
     * The access token
     */
    access_token: string
    /**
     * The number of seconds the token will be valid for
     */
    expires_in: number
    /**
     * The type of token
     *
     * (this should always be Bearer for ClientCredentialsGrant)
     */
    token_type: string
}
