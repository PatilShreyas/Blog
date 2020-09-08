import React from "react"
import Helmet from 'react-helmet';
import { graphql } from "gatsby"
import Layout from "../components/layout"

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { site, markdownRemark } = data // data.markdownRemark holds your post data
  const { siteMetadata } = site
  const { frontmatter, html } = markdownRemark
  return (
    <Layout>
      <Helmet>
        <title>{frontmatter.title} | {siteMetadata.title}</title>
        <meta name="description" content={frontmatter.metaDescription} />

        <meta name="keywords" content={frontmatter.metaKeywords} />

        <meta itemprop="name" content={frontmatter.title} />
        <meta itemprop="description" content={frontmatter.metaDescription} />
        <meta itemprop="image" content={"https://blog.shreyaspatil.dev" + frontmatter.thumbnail} />


        <meta property="og:type" content="website" />
        <meta property="og:title" content={frontmatter.title} />
        <meta property="og:description" content={frontmatter.metaDescription} />
        <meta property="og:image" content={"https://blog.shreyaspatil.dev" + frontmatter.thumbnail} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={frontmatter.title} />
        <meta name="twitter:description" content={frontmatter.metaDescription} />
        <meta name="twitter:image" content={"https://blog.shreyaspatil.dev" + frontmatter.thumbnail} />

        <link rel="canonical" href={"https://blog.shreyaspatil.dev" + frontmatter.path} />
      </Helmet>
      <div className="blog-post-container">
        <article className="post">
          
          {!frontmatter.thumbnail && (
            <div className="post-thumbnail">
              <h1 className="post-title">{frontmatter.title}</h1>
              <div className="post-meta">{frontmatter.date}</div>
            </div>
          )}
          {!!frontmatter.thumbnail && (
            <div className="post-thumbnail" style={{backgroundImage: `url(${frontmatter.thumbnail})`}}>
            </div>
          )}
          <div
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($path: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        path
        title
        thumbnail
        metaDescription
        metaKeywords
      }
    }
  }
`