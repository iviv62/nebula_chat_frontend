import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  tag: string;
  tagColor: string;
  stars: number;
  readTime: string;
  coverUrl: string;
  starred: boolean;
}

@customElement("nebula-trending")
export class NebulaTrending extends LitElement {
  createRenderRoot() {
    return this;
  }

  @state()
  private articles: Article[] = [
    {
      id: 1,
      title: "Building Real-Time Collaborative Canvases",
      excerpt:
        "Explore how WebRTC and CRDTs combine to enable seamless multi-user code execution environments...",
      author: "Alice Mercer",
      tag: "ENGINEERING",
      tagColor: "#4f8ef7",
      stars: 312,
      readTime: "6 min read",
      coverUrl:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=150&fit=crop&q=80",
      starred: false,
    },
    {
      id: 2,
      title: "The Rise of Pixel Art in Modern Games",
      excerpt:
        "From indie gems to blockbuster titles, pixel art is making a massive comeback in the gaming world...",
      author: "Ben Clarke",
      tag: "ART",
      tagColor: "#e05c5c",
      stars: 198,
      readTime: "4 min read",
      coverUrl:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=150&fit=crop&q=80",
      starred: false,
    },
  ];

  private toggleStar(id: number) {
    this.articles = this.articles.map((a) =>
      a.id === id
        ? { ...a, starred: !a.starred, stars: a.starred ? a.stars - 1 : a.stars + 1 }
        : a
    );
  }

  render() {
    return html`
      <section>
        <div class="section-header">
          <h3>Popular Articles</h3>
        </div>
        <div class="trending-grid">
          ${this.articles.map(
            (article) => html`
              <div class="trending-card">
                <div
                  class="card-banner"
                  style="background: url('${article.coverUrl}') center/cover"
                >
                  <div class="tags">
                    <span class="tag" style="background-color: ${article.tagColor}">${article.tag}</span>
                  </div>
                </div>
                <div class="card-body">
                  <h4>${article.title}</h4>
                  <p>${article.excerpt}</p>
                  <div class="card-footer">
                    <span class="members"
                      ><span class="author-dot"></span>${article.author} · ${article.readTime}</span
                    >
                    <button
                      class="btn-star ${article.starred ? "starred" : ""}"
                      @click=${() => this.toggleStar(article.id)}
                      title="${article.starred ? "Unstar" : "Star"} article"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="${article.starred ? "currentColor" : "none"}"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polygon
                          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                        ></polygon>
                      </svg>
                      ${article.stars}
                    </button>
                  </div>
                </div>
              </div>
            `
          )}
        </div>
      </section>

      <style>
        .btn-star {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
          padding: 5px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-star:hover {
          border-color: #f5c518;
          color: #f5c518;
        }
        .btn-star.starred {
          border-color: #f5c518;
          color: #f5c518;
          background: rgba(245, 197, 24, 0.1);
        }
        .author-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4f8ef7;
          margin-right: 6px;
          vertical-align: middle;
        }
      </style>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nebula-trending": NebulaTrending;
  }
}
