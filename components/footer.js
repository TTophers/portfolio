class CustomFooter extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        footer {
            background-color: #1f2937;
            color: white;
            padding: 3rem 2rem;
        }
        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }
        .footer-logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
        }
        .footer-logo-icon {
            margin-right: 0.5rem;
        }
        .footer-description {
            color: #9ca3af;
            margin-bottom: 1.5rem;
        }
        .footer-links h3 {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: white;
        }
        .footer-links ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .footer-links li {
            margin-bottom: 0.75rem;
        }
        .footer-links a {
            color: #9ca3af;
            text-decoration: none;
            transition: color 0.2s;
        }
        .footer-links a:hover {
            color: white;
        }
        .social-links {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        .social-links a {
            color: white;
            background-color: #4b5563;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        }
        .social-links a:hover {
            background-color: #6366f1;
        }
        .copyright {
            text-align: center;
            padding-top: 2rem;
            margin-top: 2rem;
            border-top: 1px solid #374151;
            color: #9ca3af;
        }
      </style>
      <footer>
        <div class="footer-content">
            <div>
                <div class="footer-logo">
                    <i data-feather="code" class="footer-logo-icon"></i>
                    DevPortfolio Pro
                </div>
                <p class="footer-description">
                    Creating beautiful, functional websites with transparent pricing and clear deliverables.
                </p>
                <div class="social-links">
                    <a href="#"><i data-feather="github"></i></a>
                    <a href="#"><i data-feather="twitter"></i></a>
                    <a href="#"><i data-feather="linkedin"></i></a>
                    <a href="#"><i data-feather="mail"></i></a>
                </div>
            </div>
            <div class="footer-links">
                <h3>Services</h3>
                <ul>
                    <li><a href="/WebDev">Web Development</a></li>
                    <li><a href="/about">About Me</a></li>
                    <li><a href="/SEO">SEO Optimization</a></li>
                    <li><a href="/WebMaint">Website Maintenance</a></li>
                </ul>
            </div>
            <div class="footer-links">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#portfolio">Portfolio</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </div>
            <div class="footer-links">
                <h3>Legal</h3>
                <ul>
                    <li><a href="/privPolc">Privacy Policy</a></li>
                    <li><a href="/TOS">Terms of Service</a></li>
                </ul>
            </div>
        </div>
        <div class="copyright">
            &copy; ${new Date().getFullYear()} DevPortfolio Pro. All rights reserved.
        </div>
      </footer>
    `;
  }
}

customElements.define('custom-footer', CustomFooter);