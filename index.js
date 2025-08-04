const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="29" height="30" viewBox="0 0 64 65" fill="none">
  <g clip-path="url(#clip0_3493_87509)">
    <path d="M54.3591 25.9485C57.6214 25.8972 59.8145 26.5674 60.4596 28.0348C62.292 32.2036 50.9361 41.2278 35.0954 48.1908C19.2547 55.1539 4.92781 57.4191 3.09535 53.2503C1.66353 49.993 8.2836 43.7713 18.8035 37.8848" stroke="#ffffff" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M45.3335 38.2131C55.5145 44.0014 61.8648 50.0535 60.4595 53.2503C58.6271 57.4191 44.3001 55.1538 28.4595 48.1908C12.6188 41.2277 1.26285 32.2035 3.09531 28.0348C3.7319 26.5866 5.87638 25.9148 9.06839 25.9468" stroke="#ffffff" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11.7852 26.553L31.8742 47.3707L51.7552 26.553L42.9076 16.5605H21.049L11.7852 26.553Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21.1924 16.5605L31.7753 47.2522" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M42.4609 16.6792L31.878 47.3708" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M11.8301 26.6479H51.4596" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24.4795 26.6481L31.7179 16.5581" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M39.1162 26.6481L31.8778 16.5581" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M31.8779 9.36453V3.60156" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M49.7179 9.36459L53.793 5.28955" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.868 9.36459L9.79297 5.28955" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_3493_87509">
      <rect width="64" height="64" fill="white" transform="translate(0 0.200195)"/>
    </clipPath>
  </defs>
</svg>`;

      class HotelIconInserter {
        constructor(options = {}) {
          this.config = {
            selector: ".hotel-list-item",
            timeout: 500,
            debounceDelay: 300,
            maxRetries: 10,
            ...options,
          };

          this.observer = null;
          this.resizeTimeout = null;
          this.isDestroyed = false;
          this.translationText = this.getLocalTranslation();

          this.init();
        }

        async init() {
          try {
            await this.insertIconsWhenReady();
            this.setupEventListeners();
            this.setupMutationObserver();
          } catch (error) {
            console.error(error);
          }
        }

        async insertIconsWhenReady() {
          const containers = await this.waitForElements();
          this.insertIcons(containers);
        }

        waitForElements() {
          return new Promise((resolve, reject) => {
            let attempts = 0;

            const check = () => {
              if (this.isDestroyed) {
                reject();
                return;
              }

              const elements = document.querySelectorAll(this.config.selector);
              const validElements = Array.from(elements).filter(
                (el) => el.getBoundingClientRect().height > 0
              );

              if (validElements.length > 0) {
                resolve(validElements);
              } else if (attempts >= this.config.maxRetries) {
                reject();
              } else {
                attempts++;
                setTimeout(check, this.config.timeout);
              }
            };

            check();
          });
        }

        insertIcons(containers) {
          containers.forEach((container) => {
            try {
              const topHotel = container.querySelector(".top-hotel");
              if (!topHotel) return;

              const badgesContainer = topHotel.querySelector(".eRVTDB");
              if (!badgesContainer || badgesContainer.querySelector("svg"))
                return;

              const oldBadge = badgesContainer.querySelector(".recommended");

              if (oldBadge.innerHTML) {
                this.replaceRecommendedBadge(oldBadge);
              } else {
                this.insertRecommendedBadge(badgesContainer);
              }
            } catch (error) {
              console.error(error);
            }
          });
        }

        insertRecommendedBadge(badgesContainer) {
          const badgeContent = `${ICON} ${this.translationText}`;
          const badgeElement = this.createBadgeElement(badgeContent);
          const hotelBadgesContainer =
            badgesContainer.querySelector(".hotel-badges");

          if (hotelBadgesContainer) {
            hotelBadgesContainer.insertAdjacentElement(
              "afterbegin",
              badgeElement
            );
          } else {
            badgesContainer.insertAdjacentElement("afterbegin", badgeElement);
          }
        }

        replaceRecommendedBadge(oldBadge) {
          oldBadge.innerHTML = ICON + this.translationText;
          this.applyStyles(oldBadge);
        }

        createBadgeElement(content) {
          const badge = document.createElement("div");
          badge.className = "recommended";
          badge.innerHTML = content;
          this.applyStyles(badge);
          return badge;
        }

        applyStyles(element) {
          Object.assign(element.style, {
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fab60b",
            color: "#ffffff",
          });
        }

        getLocalTranslation() {
          try {
            const nextDataElement = document.getElementById("__NEXT_DATA__");
            if (!nextDataElement) return "Rekomenduojama";

            const nextData = JSON.parse(nextDataElement.textContent);
            const selectedLanguage =
              nextData?.props?.pageProps?.pageData?.meta?.selectedLanguage;

            const translations = {
              "lt-LT": "Rekomenduojama",
              "en-US": "Recommended",
            };

            return translations[selectedLanguage] || "Rekomenduojama";
          } catch (error) {
            console.error(error);
            return "Rekomenduojama";
          }
        }

        setupEventListeners() {
          this.handleResize = () => {
            if (this.resizeTimeout) {
              clearTimeout(this.resizeTimeout);
            }

            this.resizeTimeout = setTimeout(() => {
              if (!this.isDestroyed) {
                this.insertIconsWhenReady().catch(console.error);
              }
            }, this.config.debounceDelay);
          };

          window.addEventListener("resize", this.handleResize, {
            passive: true,
          });
        }

        setupMutationObserver() {
          this.handleMutation = this.debounce(() => {
            if (!this.isDestroyed) {
              const elements = document.querySelectorAll(this.config.selector);
              if (elements.length) {
                this.insertIcons(elements);
              }
            }
          }, this.config.debounceDelay);

          const containerToWatch = document.querySelector(".lazyHotelList");

          this.observer = new MutationObserver(this.handleMutation);
          this.observer.observe(containerToWatch, {
            childList: true,
            subtree: true,
          });
        }

        debounce(func, wait) {
          let timeout;
          return function executedFunction(...args) {
            const later = () => {
              clearTimeout(timeout);
              func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
          };
        }

        destroy() {
          this.isDestroyed = true;

          if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
          }

          if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = null;
          }

          window.removeEventListener("resize", this.handleResize);
        }
      }

      const hotelIconInserter = new HotelIconInserter({
          selector: ".hotel-list-item",
          timeout: 500,
          debounceDelay: 300,
        });
  
        window.addEventListener("beforeunload", () => {
          hotelIconInserter.destroy();
        });
