// =====================================================
// DOANA DIGITAL
// LIGHTWEIGHT PRIVACY-CONSCIOUS WEBSITE ANALYTICS
// =====================================================

(() => {

  "use strict";


  // =====================================================
  // CONFIGURATION
  // =====================================================

  const ANALYTICS_SUPABASE_URL =
    "https://efbmmxtteekbjayiesft.supabase.co";


  const ANALYTICS_SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";


  const VISITOR_STORAGE_KEY =
    "doanaVisitorId";


  const COUNTRY_STORAGE_KEY =
    "doanaVisitorCountry";


  const COUNTRY_CACHE_DURATION =
    24 * 60 * 60 * 1000; // 24 hours



  // =====================================================
  // SAFE LOCAL STORAGE
  // =====================================================

  function getStoredValue(key) {

    try {

      return localStorage.getItem(
        key
      );

    } catch {

      return null;

    }

  }


  function setStoredValue(
    key,
    value
  ) {

    try {

      localStorage.setItem(
        key,
        value
      );

    } catch {

      // Analytics should never break the website.

    }

  }



  // =====================================================
  // RANDOM VISITOR ID
  // =====================================================

  function createVisitorId() {

    if (
      window.crypto &&
      typeof window.crypto.randomUUID ===
        "function"
    ) {

      return crypto.randomUUID();

    }


    // Fallback for older browsers.

    return (

      "visitor-" +

      Date.now().toString(36) +

      "-" +

      Math.random()
        .toString(36)
        .substring(2, 12)

    );

  }



  // =====================================================
  // VISITOR ID
  // =====================================================

  function getAnalyticsVisitorId() {

    let visitorId =
      getStoredValue(
        VISITOR_STORAGE_KEY
      );


    if (!visitorId) {

      visitorId =
        createVisitorId();


      setStoredValue(
        VISITOR_STORAGE_KEY,
        visitorId
      );

    }


    return visitorId;

  }



  // =====================================================
  // PAGE NAME
  // =====================================================

  function getAnalyticsPageName() {

    const currentPage =
      window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


    if (
      !currentPage ||
      currentPage === "index.html"
    ) {

      return "Home";

    }


    const names = {

      "services.html":
        "Services",

      "about.html":
        "About",

      "feedback.html":
        "Feedback",

      "contact.html":
        "Contact",

      "privacy.html":
        "Privacy",

      "404.html":
        "404"

    };


    return (
      names[currentPage] ||
      currentPage
    );

  }



  // =====================================================
  // CURRENT PAGE PATH
  // =====================================================

  function getAnalyticsPath() {

    return window.location.pathname;

  }



  // =====================================================
  // ADMIN PAGE CHECK
  // =====================================================

  function isAdminPage() {

    const currentPage =
      window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


    return (
      currentPage === "admin.html" ||
      currentPage === "reset-password.html"
    );

  }



  // =====================================================
  // URL PARAMETERS
  // =====================================================

  function getUrlParameters() {

    return new URLSearchParams(
      window.location.search
    );

  }



  // =====================================================
  // UTM PARAMETERS
  // =====================================================

  function getCampaignData() {

    const params =
      getUrlParameters();


    return {

      source:
        params.get(
          "utm_source"
        ),

      medium:
        params.get(
          "utm_medium"
        ),

      campaign:
        params.get(
          "utm_campaign"
        )

    };

  }



  // =====================================================
  // SAFE REFERRER HOSTNAME
  // =====================================================

  function getReferrerHostname() {

    if (!document.referrer) {

      return null;

    }


    try {

      return new URL(
        document.referrer
      ).hostname
        .replace(/^www\./, "")
        .toLowerCase();

    } catch {

      return null;

    }

  }



  // =====================================================
  // TRAFFIC SOURCE
  // =====================================================

  function getTrafficSource() {

    const campaign =
      getCampaignData();


    // ---------------------------------------------
    // UTM SOURCE HAS PRIORITY
    // ---------------------------------------------

    if (campaign.source) {

      return campaign.source
        .trim()
        .substring(0, 100);

    }


    const hostname =
      getReferrerHostname();


    if (!hostname) {

      return "Direct";

    }


    // ---------------------------------------------
    // INTERNAL NAVIGATION
    // ---------------------------------------------

    const currentHostname =
      window.location.hostname
        .replace(/^www\./, "")
        .toLowerCase();


    if (
      hostname ===
        currentHostname ||
      hostname.endsWith(
        `.${currentHostname}`
      )
    ) {

      return "Internal";

    }


    // ---------------------------------------------
    // SEARCH ENGINES
    // ---------------------------------------------

    if (
      hostname.includes(
        "google."
      )
    ) {

      return "Google";

    }


    if (
      hostname.includes(
        "bing.com"
      )
    ) {

      return "Bing";

    }


    if (
      hostname.includes(
        "yahoo."
      )
    ) {

      return "Yahoo";

    }


    if (
      hostname.includes(
        "duckduckgo.com"
      )
    ) {

      return "DuckDuckGo";

    }


    // ---------------------------------------------
    // SOCIAL MEDIA
    // ---------------------------------------------

    if (
      hostname.includes(
        "instagram.com"
      )
    ) {

      return "Instagram";

    }


    if (
      hostname.includes(
        "linkedin.com"
      )
    ) {

      return "LinkedIn";

    }


    if (
      hostname.includes(
        "facebook.com"
      ) ||
      hostname.includes(
        "fb.com"
      )
    ) {

      return "Facebook";

    }


    if (
      hostname.includes(
        "t.co"
      ) ||
      hostname.includes(
        "twitter.com"
      ) ||
      hostname.includes(
        "x.com"
      )
    ) {

      return "X";

    }


    if (
      hostname.includes(
        "youtube.com"
      ) ||
      hostname.includes(
        "youtu.be"
      )
    ) {

      return "YouTube";

    }


    if (
      hostname.includes(
        "pinterest."
      )
    ) {

      return "Pinterest";

    }


    // ---------------------------------------------
    // OTHER WEBSITE
    // ---------------------------------------------

    return hostname.substring(
      0,
      150
    );

  }



  // =====================================================
  // COUNTRY CACHE
  // =====================================================

  function getCachedCountry() {

    const cached =
      getStoredValue(
        COUNTRY_STORAGE_KEY
      );


    if (!cached) {

      return null;

    }


    try {

      const parsed =
        JSON.parse(
          cached
        );


      if (
        !parsed ||
        !parsed.timestamp
      ) {

        return null;

      }


      const age =
        Date.now() -
        parsed.timestamp;


      if (
        age >
        COUNTRY_CACHE_DURATION
      ) {

        return null;

      }


      return {

        code:
          parsed.code ||
          null,

        name:
          parsed.name ||
          null

      };


    } catch {

      return null;

    }

  }



  function cacheCountry(
    country
  ) {

    if (
      !country ||
      !country.code
    ) {

      return;

    }


    setStoredValue(

      COUNTRY_STORAGE_KEY,

      JSON.stringify({

        code:
          country.code,

        name:
          country.name,

        timestamp:
          Date.now()

      })

    );

  }



  // =====================================================
  // COUNTRY LOOKUP
  // =====================================================

  async function getVisitorCountry() {

    // ---------------------------------------------
    // USE CACHE FIRST
    // ---------------------------------------------

    const cachedCountry =
      getCachedCountry();


    if (cachedCountry) {

      return cachedCountry;

    }


    try {

      const controller =
        new AbortController();


      const timeout =
        setTimeout(
          () => {

            controller.abort();

          },
          4000
        );


      const response =
        await fetch(

          "https://ipwho.is/",

          {

            signal:
              controller.signal,

            cache:
              "no-store"

          }

        );


      clearTimeout(
        timeout
      );


      if (!response.ok) {

        throw new Error(
          "Country lookup failed."
        );

      }


      const data =
        await response.json();


      if (
        data.success ===
        false
      ) {

        throw new Error(
          "Country lookup unavailable."
        );

      }


      const country = {

        code:
          data.country_code
            ? String(
                data.country_code
              )
                .toUpperCase()
                .substring(0, 2)
            : null,

        name:
          data.country
            ? String(
                data.country
              ).substring(
                0,
                100
              )
            : null

      };


      cacheCountry(
        country
      );


      return country;


    } catch (error) {

      console.warn(
        "Country analytics unavailable:",
        error
      );


      return {

        code:
          null,

        name:
          null

      };

    }

  }



  // =====================================================
  // PREVENT DUPLICATE TRACKING
  // =====================================================

  function hasPageAlreadyBeenTracked() {

    const key =

      "doanaTracked:" +

      window.location.pathname +

      window.location.search;


    try {

      if (
        sessionStorage.getItem(
          key
        )
      ) {

        return true;

      }


      sessionStorage.setItem(
        key,
        "1"
      );


      return false;


    } catch {

      return false;

    }

  }



  // =====================================================
  // TRACK PAGE VIEW
  // =====================================================

  async function trackPageView() {

    // ---------------------------------------------
    // NEVER TRACK ADMIN
    // ---------------------------------------------

    if (
      isAdminPage()
    ) {

      return;

    }


    // ---------------------------------------------
    // DON'T DOUBLE TRACK SAME PAGE LOAD
    // ---------------------------------------------

    if (
      hasPageAlreadyBeenTracked()
    ) {

      return;

    }


    try {

      const visitorId =
        getAnalyticsVisitorId();


      const country =
        await getVisitorCountry();


      const campaign =
        getCampaignData();


      const pageView = {

        visitor_id:
          visitorId,

        page:
          getAnalyticsPageName(),

        path:
          getAnalyticsPath(),

        country_code:
          country.code,

        country_name:
          country.name,

        // Store hostname rather than full referring URL.
        // This avoids unnecessarily storing query strings.

        referrer:
          getReferrerHostname(),

        source:
          getTrafficSource()

      };


      // =================================================
      // OPTIONAL UTM COLUMNS
      // =================================================
      //
      // These are added ONLY if your page_views table
      // contains these columns.
      //
      // If you have NOT created these Supabase columns,
      // leave this block commented.
      //
      // pageView.utm_source =
      //   campaign.source;
      //
      // pageView.utm_medium =
      //   campaign.medium;
      //
      // pageView.utm_campaign =
      //   campaign.campaign;
      // =================================================


      const response =
        await fetch(

          `${ANALYTICS_SUPABASE_URL}/rest/v1/page_views`,

          {

            method:
              "POST",

            headers: {

              apikey:
                ANALYTICS_SUPABASE_PUBLISHABLE_KEY,

              Authorization:
                `Bearer ${ANALYTICS_SUPABASE_PUBLISHABLE_KEY}`,

              "Content-Type":
                "application/json",

              Prefer:
                "return=minimal"

            },

            body:
              JSON.stringify(
                pageView
              )

          }

        );


      if (!response.ok) {

        console.warn(
          "Analytics insert failed:",
          await response.text()
        );

      }


    } catch (error) {

      console.warn(
        "Analytics error:",
        error
      );

    }

  }



  // =====================================================
  // START ANALYTICS
  // =====================================================

  trackPageView();


})();