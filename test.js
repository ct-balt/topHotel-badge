var ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="29" height="30" viewBox="0 0 64 65" fill="none">
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

const CONFIG = {
  maxRetries: 10,
  timeout: 500,
  debounceDelay: 200,
};

(async function insertIconsWhenReady() {
  let observer;

  async function initInsert() {
    try {
      const containers = await waitForElement();
      insertIcons(containers);
    } catch (error) {
      console.log("catched error");
      return false;
    }
    return true;
  }
  function waitForElement() {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const check = () => {
        const topHotelElements = getTopHotelElements();

        if (topHotelElements.length > 0) {
          resolve(topHotelElements);
        } else if (attempts >= CONFIG.maxRetries) {
          reject(new Error(""));
        } else {
          attempts++;
          setTimeout(check, CONFIG.timeout);
        }
      };
      check();
    });
  }

  function insertIcons(containers) {
    console.log("insertIcons");
    containers.forEach((container) => {
      const badgesContainer = container.querySelector(".eRVTDB");
      if (!badgesContainer) return;

      if (badgesContainer.querySelector("svg")) {
        console.log("returned because svg found");
        return;
      }

      const oldBadge = badgesContainer.querySelector(".recommended");

      if (oldBadge && oldBadge.innerHTML.trim()) {
        replaceRecommendedBadge(oldBadge);
      } else {
        insertRecommendedBadge(badgesContainer);
      }
    });
  }

  function insertRecommendedBadge(badgesContainer) {
    const badgeContent = `${ICON} ${getLocalTranslation()}`;
    const badgeElement = createBadgeElement(badgeContent);
    const hotelBadgesContainer = badgesContainer.querySelector(".hotel-badges");

    if (hotelBadgesContainer) {
      hotelBadgesContainer.insertAdjacentElement("afterbegin", badgeElement);
    } else {
      badgesContainer.insertAdjacentElement("afterbegin", badgeElement);
    }
  }

  function replaceRecommendedBadge(oldBadge) {
    oldBadge.innerHTML = ICON + getLocalTranslation();
    applyStyles(oldBadge);
  }

  function createBadgeElement(content) {
    const badge = document.createElement("div");
    badge.className = "recommended";
    badge.innerHTML = content;
    applyStyles(badge);
    return badge;
  }

  function getTopHotelElements() {
    return Array.from(document.querySelectorAll(".top-hotel"));
  }

  function getLocalTranslation() {
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
      return "Rekomenduojama";
    }
  }

  function applyStyles(element) {
    Object.assign(element.style, {
      display: "flex",
      gap: "8px",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fab60b",
      color: "#ffffff",
    });

    element.style.setProperty("display", "flex", "important");
    element.style.setProperty("background-color", "#fab60b", "important");
  }

  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  await initInsert();

  const debouncedInit = debounce(initInsert, CONFIG.debounceDelay);
  observer = new MutationObserver(() => {
    console.log("observer function");
    const topHotelElements = getTopHotelElements();

    if (topHotelElements.length === 0) return;

    const missingIcons = topHotelElements.some((hotel) => {
      const badgesContainer = hotel.querySelector(".eRVTDB");
      return badgesContainer && !badgesContainer.querySelector("svg");
    });

    if (missingIcons) {
      console.log("debounce call");
      debouncedInit();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
