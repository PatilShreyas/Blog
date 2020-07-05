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
        <p>&copy; {new Date().getFullYear()} Shreyas Patil &bull; Crafted with <span role="img" aria-label="love">❤️</span> by <a href="https://w3layouts.com">W3Layouts</a></p>
      </footer>
    </div>
  )
}
