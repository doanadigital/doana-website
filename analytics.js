// =====================================================
// DOANA DIGITAL
// LIGHTWEIGHT WEBSITE ANALYTICS
// =====================================================


// =====================================================
// SUPABASE
// =====================================================

const ANALYTICS_SUPABASE_URL =
  "https://efbmmxtteekbjayiesft.supabase.co";


const ANALYTICS_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";



// =====================================================
// VISITOR ID
// =====================================================

function getAnalyticsVisitorId() {

  const storageKey =
    "doanaVisitorId";


  let visitorId =
    localStorage.getItem(
      storageKey
    );


  if (!visitorId) {

    visitorId =
      crypto.randomUUID();


    localStorage.setItem(
      storageKey,
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
      .pop();


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
// TRAFFIC SOURCE
// =====================================================

function getTrafficSource() {

  const referrer =
    document.referrer;


  if (!referrer) {

    return "Direct";

  }


  try {

    const hostname =
      new URL(
        referrer
      ).hostname
        .toLowerCase();


    if (
      hostname.includes(
        "instagram"
      )
    ) {

      return "Instagram";

    }


    if (
      hostname.includes(
        "linkedin"
      )
    ) {

      return "LinkedIn";

    }


    if (
      hostname.includes(
        "google"
      )
    ) {

      return "Google";

    }


    if (
      hostname.includes(
        "facebook"
      )
    ) {

      return "Facebook";

    }


    if (
      hostname.includes(
        "bing"
      )
    ) {

      return "Bing";

    }


    if (
      hostname.includes(
        window.location.hostname
      )
    ) {

      return "Internal";

    }


    return hostname;


  } catch {

    return "Other";

  }

}



// =====================================================
// COUNTRY LOOKUP
// =====================================================

async function getVisitorCountry() {

  try {

    const response =
      await fetch(
        "https://ipwho.is/"
      );


    if (!response.ok) {

      throw new Error(
        "Country lookup failed"
      );

    }


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        "Country lookup unavailable"
      );

    }


    return {

      code:
        data.country_code ||
        null,

      name:
        data.country ||
        null

    };


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
// TRACK PAGE VIEW
// =====================================================

async function trackPageView() {

  // Never track the admin dashboard

  if (
    window.location.pathname
      .includes(
        "admin.html"
      )
  ) {

    return;

  }


  try {

    const visitorId =
      getAnalyticsVisitorId();


    const country =
      await getVisitorCountry();


    const pageView = {

      visitor_id:
        visitorId,

      page:
        getAnalyticsPageName(),

      path:
        window.location.pathname,

      country_code:
        country.code,

      country_name:
        country.name,

      referrer:
        document.referrer ||
        null,

      source:
        getTrafficSource()

    };


    const response =
      await fetch(

        `${ANALYTICS_SUPABASE_URL}/rest/v1/page_views`,

        {

          method:
            "POST",

          headers: {

            "apikey":
              ANALYTICS_SUPABASE_PUBLISHABLE_KEY,

            "Authorization":
              `Bearer ${ANALYTICS_SUPABASE_PUBLISHABLE_KEY}`,

            "Content-Type":
              "application/json",

            "Prefer":
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
// START
// =====================================================

trackPageView();