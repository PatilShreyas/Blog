import React from "react"
import { Link } from "gatsby"
import Navigation from "../components/navigation"

export default ({ children }) => {
  return (
    <div className="site-wrapper">
      <header className="site-header">
        <div className="site-title">
          <Link to="/">Shreyas Patil's Blog</Link>
        </div>
        <Navigation />
      </header>
      {children}
      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} Shreyas Patil &bull; Credits: <a href="https://github.com/W3Layouts/gatsby-starter-delog">W3Layouts</a></p>
      </footer>
    </div>
  )
}
