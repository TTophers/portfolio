class CustomNavbar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        nav {
            background-color: #0F172A;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 50;
            transition: background-color 0.4s ease, color 0.4s ease;
        }
        .logo {
            color: #2563eb;
            font-weight: bold;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
        }
        .logo-icon {
            margin-right: 0.5rem;
        }
        ul {
            display: flex;
            gap: 1.5rem;
            list-style: none;
            margin: 0;
            padding: 0;
        }
        a {
            color: #ffffff;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            transition: background-color 0.4s ease, color 0.4s ease;
        }
        a:hover {
            color: #6366f1;
        }
        .contact-btn {
            background-color: #2563eb;
            color: white;
        }
        .contact-btn:hover {
            background-color: #1e40af;
            color: white;
        }
        .mobile-menu-btn {
            display: none;
            background: none;
            border: none;
            color: #4b5563;
            cursor: pointer;
        }
        @media (max-width: 768px) {
            ul {
                display: none;
            }
            .mobile-menu-btn {
                display: block;
            }
        }
        :host-context(.dark) nav {
            background-color: #111827;
            box-shadow: 0 4px 6px -1px rgba(255, 255, 255, 0.1);
        }
        :host-context(.dark) a {
            color: #ffffff;
        }
        :host-context(.dark) a:hover {
            color: #8b5cf6;
        }
        :host-context(.dark) .contact-btn {
            background-color: #2563eb;
            color: white;
        }
        :host-context(.dark) .contact-btn:hover {
            background-color: #1e40af;
            color: white;
        }
      </style>
      <nav>
        <a href="/" class="logo">
            <i data-feather="code" class="logo-icon"></i>
            Tophers Design
        </a>
        <button class="mobile-menu-btn">
            <i data-feather="menu"></i>
        </button>
        <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#portfolio">Portfolio</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="/client-loggin.html" class="contact-btn">Login</a></li>
        </ul>
      </nav>
    `;
  }
}
customElements.define('custom-navbar', CustomNavbar);