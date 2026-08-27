// =====================================================
// DOANA DIGITAL
// ADMIN DASHBOARD
//
// Features:
// - Admin authentication
// - Password reset
// - Analytics
// - Contact inquiry management
// - Review moderation
// - USD master service pricing
// - Regional exchange rates
// - Market multipliers
// - Country-specific pricing overrides
// - Session restoration
// =====================================================


// =====================================================
// SUPABASE CONFIG
// =====================================================

const SUPABASE_URL =
  "https://efbmmxtteekbjayiesft.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";


const PASSWORD_RESET_URL =
  new URL(
    "reset-password.html",
    window.location.href
  ).href;


// =====================================================
// GENERAL DOM
// =====================================================

const loginSection =
  document.getElementById(
    "adminLogin"
  );


const dashboard =
  document.getElementById(
    "adminDashboard"
  );


const loginForm =
  document.getElementById(
    "adminLoginForm"
  );


const loginButton =
  document.getElementById(
    "adminLoginButton"
  );


const loginMessage =
  document.getElementById(
    "adminLoginMessage"
  );


const forgotPasswordButton =
  document.getElementById(
    "forgotPassword"
  );


const resetMessage =
  document.getElementById(
    "resetMessage"
  );


const logoutButton =
  document.getElementById(
    "adminLogout"
  );


// =====================================================
// MAIN TABS
// =====================================================

const analyticsTab =
  document.getElementById(
    "analyticsTab"
  );


const inquiriesTab =
  document.getElementById(
    "inquiriesTab"
  );


const reviewsTab =
  document.getElementById(
    "reviewsTab"
  );


const pricingTab =
  document.getElementById(
    "pricingTab"
  );


const analyticsPanel =
  document.getElementById(
    "analyticsPanel"
  );


const inquiriesPanel =
  document.getElementById(
    "inquiriesPanel"
  );


const reviewsPanel =
  document.getElementById(
    "reviewsPanel"
  );


const pricingPanel =
  document.getElementById(
    "pricingPanel"
  );


// =====================================================
// ANALYTICS DOM
// =====================================================

const totalPageViews =
  document.getElementById(
    "totalPageViews"
  );


const uniqueVisitors =
  document.getElementById(
    "uniqueVisitors"
  );


const todayViews =
  document.getElementById(
    "todayViews"
  );


const weekViews =
  document.getElementById(
    "weekViews"
  );


const topPages =
  document.getElementById(
    "topPages"
  );


const countryAnalytics =
  document.getElementById(
    "countryAnalytics"
  );


const trafficSources =
  document.getElementById(
    "trafficSources"
  );


const recentVisits =
  document.getElementById(
    "recentVisits"
  );


// =====================================================
// INQUIRIES DOM
// =====================================================

const inquiryList =
  document.getElementById(
    "adminInquiryList"
  );


const inquiryActionMessage =
  document.getElementById(
    "inquiryActionMessage"
  );


const newInquiryCount =
  document.getElementById(
    "newInquiryCount"
  );


const contactedInquiryCount =
  document.getElementById(
    "contactedInquiryCount"
  );


const closedInquiryCount =
  document.getElementById(
    "closedInquiryCount"
  );


const inquiryFilterButtons =
  document.querySelectorAll(
    ".inquiry-filter"
  );


// =====================================================
// REVIEWS DOM
// =====================================================

const reviewList =
  document.getElementById(
    "adminReviewList"
  );


const actionMessage =
  document.getElementById(
    "adminActionMessage"
  );


const pendingCount =
  document.getElementById(
    "pendingCount"
  );


const approvedCount =
  document.getElementById(
    "approvedCount"
  );


const rejectedCount =
  document.getElementById(
    "rejectedCount"
  );


const reviewFilterButtons =
  document.querySelectorAll(
    ".admin-filter"
  );


// =====================================================
// PRICING DOM
// =====================================================

const adminServicePricing =
  document.getElementById(
    "adminServicePricing"
  );


const adminRegionPricing =
  document.getElementById(
    "adminRegionPricing"
  );


const adminPricingOverrides =
  document.getElementById(
    "adminPricingOverrides"
  );


const pricingAdminMessage =
  document.getElementById(
    "pricingAdminMessage"
  );


const overrideService =
  document.getElementById(
    "overrideService"
  );


const overrideCountry =
  document.getElementById(
    "overrideCountry"
  );


const overridePrice =
  document.getElementById(
    "overridePrice"
  );


const saveOverrideButton =
  document.getElementById(
    "saveOverride"
  );


// =====================================================
// STATE
// =====================================================

let accessToken =
  null;


let currentInquiryFilter =
  "new";


let currentReviewFilter =
  "pending";


let adminPricingServices =
  [];


let adminPricingRegions =
  [];


// =====================================================
// HELPERS
// =====================================================

function showMessage(
  element,
  message
) {

  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.style.display =
    "block";

}


function hideMessage(
  element
) {

  if (!element) {
    return;
  }


  element.textContent =
    "";


  element.style.display =
    "none";

}


function escapeHtml(
  value
) {

  return String(
    value ?? ""
  ).replace(

    /[&<>"']/g,

    character => ({

      "&":
        "&amp;",

      "<":
        "&lt;",

      ">":
        "&gt;",

      '"':
        "&quot;",

      "'":
        "&#039;"

    })[character]

  );

}


function formatDate(
  value
) {

  if (!value) {

    return "—";

  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "—";

  }


  return date.toLocaleString();

}


// =====================================================
// ADMIN API REQUEST
// =====================================================

async function adminRequest(
  endpoint,
  options = {}
) {

  if (!accessToken) {

    throw new Error(
      "Admin session unavailable."
    );

  }


  const response =
    await fetch(

      `${SUPABASE_URL}/rest/v1/${endpoint}`,

      {

        ...options,

        headers: {

          apikey:
            SUPABASE_PUBLISHABLE_KEY,

          Authorization:
            `Bearer ${accessToken}`,

          "Content-Type":
            "application/json",

          ...(options.headers || {})

        }

      }

    );


  if (!response.ok) {

    const errorText =
      await response.text();


    throw new Error(
      errorText ||
      `Request failed (${response.status}).`
    );

  }


  const text =
    await response.text();


  return text
    ? JSON.parse(
        text
      )
    : null;

}


// =====================================================
// LOGIN
// =====================================================

loginForm?.addEventListener(

  "submit",

  async event => {


    event.preventDefault();


    hideMessage(
      loginMessage
    );


    hideMessage(
      resetMessage
    );


    const email =
      document
        .getElementById(
          "adminEmail"
        )
        ?.value
        ?.trim();


    const password =
      document
        .getElementById(
          "adminPassword"
        )
        ?.value;


    if (
      !email ||
      !password
    ) {

      showMessage(

        loginMessage,

        "Enter your email and password."

      );


      return;

    }


    if (loginButton) {

      loginButton.disabled =
        true;


      loginButton.textContent =
        "Signing in...";

    }


    try {

      const response =
        await fetch(

          `${SUPABASE_URL}/auth/v1/token?grant_type=password`,

          {

            method:
              "POST",

            headers: {

              apikey:
                SUPABASE_PUBLISHABLE_KEY,

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({

                email,

                password

              })

          }

        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result.access_token
      ) {

        throw new Error(
          "LOGIN_FAILED"
        );

      }


      accessToken =
        result.access_token;


      const admin =
        await verifyAdmin();


      if (!admin) {

        accessToken =
          null;


        throw new Error(
          "NOT_ADMIN"
        );

      }


      sessionStorage.setItem(

        "doanaAdminToken",

        accessToken

      );


      await showDashboard();


    } catch (error) {

      console.error(
        "Admin login:",
        error
      );


      if (
        error.message ===
        "NOT_ADMIN"
      ) {

        showMessage(

          loginMessage,

          "This account does not have Doana admin permission."

        );


      } else {

        showMessage(

          loginMessage,

          "Incorrect email or password. Please try again."

        );

      }


    } finally {

      if (loginButton) {

        loginButton.disabled =
          false;


        loginButton.textContent =
          "Sign In";

      }

    }

  }

);


// =====================================================
// VERIFY ADMIN
// =====================================================

async function verifyAdmin() {

  if (!accessToken) {

    return false;

  }


  try {

    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/admin_users?select=user_id`,

        {

          headers: {

            apikey:
              SUPABASE_PUBLISHABLE_KEY,

            Authorization:
              `Bearer ${accessToken}`

          }

        }

      );


    if (!response.ok) {

      return false;

    }


    const admins =
      await response.json();


    return (

      Array.isArray(
        admins
      )

      &&

      admins.length >
      0

    );


  } catch (error) {

    console.error(
      "Admin verification:",
      error
    );


    return false;

  }

}


// =====================================================
// FORGOT PASSWORD
// =====================================================

forgotPasswordButton?.addEventListener(

  "click",

  async () => {


    hideMessage(
      loginMessage
    );


    hideMessage(
      resetMessage
    );


    const email =
      document
        .getElementById(
          "adminEmail"
        )
        ?.value
        ?.trim();


    if (!email) {

      showMessage(

        resetMessage,

        "Enter your admin email first."

      );


      return;

    }


    forgotPasswordButton.disabled =
      true;


    forgotPasswordButton.textContent =
      "Sending...";


    try {

      const response =
        await fetch(

          `${SUPABASE_URL}/auth/v1/recover`,

          {

            method:
              "POST",

            headers: {

              apikey:
                SUPABASE_PUBLISHABLE_KEY,

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({

                email,

                redirect_to:
                  PASSWORD_RESET_URL

              })

          }

        );


      if (!response.ok) {

        throw new Error(
          await response.text()
        );

      }


      showMessage(

        resetMessage,

        "If this email belongs to the admin account, a password reset link has been sent."

      );


    } catch (error) {

      console.error(
        "Password reset:",
        error
      );


      showMessage(

        resetMessage,

        "Unable to send the password reset email."

      );


    } finally {

      forgotPasswordButton.disabled =
        false;


      forgotPasswordButton.textContent =
        "Forgot password?";

    }

  }

);


// =====================================================
// DASHBOARD
// =====================================================

async function showDashboard() {

  if (loginSection) {

    loginSection.style.display =
      "none";

  }


  if (dashboard) {

    dashboard.style.display =
      "block";

  }


  hideMessage(
    actionMessage
  );


  hideMessage(
    inquiryActionMessage
  );


  hideMessage(
    pricingAdminMessage
  );


  await Promise.allSettled([

    loadInquiryCounts(),

    loadReviewCounts()

  ]);


  showAdminPanel(
    "analytics"
  );

}


// =====================================================
// MAIN PANEL SYSTEM
// =====================================================

function showAdminPanel(
  selectedPanel
) {

  const tabs = [

    analyticsTab,

    inquiriesTab,

    reviewsTab,

    pricingTab

  ];


  const panels = [

    analyticsPanel,

    inquiriesPanel,

    reviewsPanel,

    pricingPanel

  ];


  tabs.forEach(
    tab => {

      tab
        ?.classList
        .remove(
          "active"
        );

    }
  );


  panels.forEach(
    panel => {

      if (panel) {

        panel.style.display =
          "none";

      }

    }
  );


  const projectManagementPanel =
    document.getElementById(
      "projectManagementPanel"
    );


  if (projectManagementPanel) {

    projectManagementPanel.style.display =
      "none";

  }


  if (
    selectedPanel ===
    "analytics"
  ) {

    analyticsTab
      ?.classList
      .add(
        "active"
      );


    if (analyticsPanel) {

      analyticsPanel.style.display =
        "block";

    }


    loadAnalytics();


    return;

  }


  if (
    selectedPanel ===
    "inquiries"
  ) {

    inquiriesTab
      ?.classList
      .add(
        "active"
      );


    if (inquiriesPanel) {

      inquiriesPanel.style.display =
        "block";

    }


    loadInquiries();


    return;

  }


  if (
    selectedPanel ===
    "reviews"
  ) {

    reviewsTab
      ?.classList
      .add(
        "active"
      );


    if (reviewsPanel) {

      reviewsPanel.style.display =
        "block";

    }


    loadReviews();


    return;

  }


  if (
    selectedPanel ===
    "pricing"
  ) {

    pricingTab
      ?.classList
      .add(
        "active"
      );


    if (pricingPanel) {

      pricingPanel.style.display =
        "block";

    }


    loadAdminPricing();

  }

}


// =====================================================
// MAIN TAB EVENTS
// =====================================================

analyticsTab?.addEventListener(

  "click",

  () => {

    showAdminPanel(
      "analytics"
    );

  }

);


inquiriesTab?.addEventListener(

  "click",

  () => {

    showAdminPanel(
      "inquiries"
    );

  }

);


reviewsTab?.addEventListener(

  "click",

  () => {

    showAdminPanel(
      "reviews"
    );

  }

);


pricingTab?.addEventListener(

  "click",

  () => {

    showAdminPanel(
      "pricing"
    );

  }

);


// =====================================================
// ANALYTICS
// =====================================================

async function loadAnalytics() {

  if (!accessToken) {

    return;

  }


  if (totalPageViews) {

    totalPageViews.textContent =
      "…";

  }


  if (uniqueVisitors) {

    uniqueVisitors.textContent =
      "…";

  }


  if (todayViews) {

    todayViews.textContent =
      "…";

  }


  if (weekViews) {

    weekViews.textContent =
      "…";

  }


  try {

    const views =
      await adminRequest(

        "page_views?" +

        "select=" +

        "id," +
        "visitor_id," +
        "page," +
        "path," +
        "country_code," +
        "country_name," +
        "referrer," +
        "source," +
        "created_at" +

        "&order=created_at.desc"

      );


    renderAnalytics(
      views || []
    );


  } catch (error) {

    console.error(
      "Analytics:",
      error
    );


    if (topPages) {

      topPages.innerHTML = `

        <p class="note">
          Unable to load analytics.
        </p>

      `;

    }

  }

}


// =====================================================
// RENDER ANALYTICS
// =====================================================

function renderAnalytics(
  views
) {

  if (!Array.isArray(views)) {

    views = [];

  }


  if (totalPageViews) {

    totalPageViews.textContent =
      views.length
        .toLocaleString();

  }


  const visitorIds =
    views
      .map(
        view =>
          view.visitor_id
      )
      .filter(
        Boolean
      );


  if (uniqueVisitors) {

    uniqueVisitors.textContent =
      new Set(
        visitorIds
      )
        .size
        .toLocaleString();

  }


  const now =
    new Date();


  const todayStart =
    new Date(

      now.getFullYear(),

      now.getMonth(),

      now.getDate()

    );


  const todayCount =
    views.filter(
      view => {

        const date =
          new Date(
            view.created_at
          );


        return (

          !Number.isNaN(
            date.getTime()
          )

          &&

          date >=
          todayStart

        );

      }
    ).length;


  if (todayViews) {

    todayViews.textContent =
      todayCount
        .toLocaleString();

  }


  const sevenDaysAgo =
    new Date();


  sevenDaysAgo.setDate(

    sevenDaysAgo.getDate() -
    7

  );


  const weeklyCount =
    views.filter(
      view => {

        const date =
          new Date(
            view.created_at
          );


        return (

          !Number.isNaN(
            date.getTime()
          )

          &&

          date >=
          sevenDaysAgo

        );

      }
    ).length;


  if (weekViews) {

    weekViews.textContent =
      weeklyCount
        .toLocaleString();

  }


  renderTopPages(
    views
  );


  renderCountries(
    views
  );


  renderTrafficSources(
    views
  );


  renderRecentVisits(
    views
  );

}


// =====================================================
// TOP PAGES
// =====================================================

function renderTopPages(
  views
) {

  if (!topPages) {

    return;

  }


  const counts =
    {};


  views.forEach(
    view => {

      const page =
        view.page ||
        "Unknown";


      counts[page] =
        (
          counts[page] ||
          0
        )
        +
        1;

    }
  );


  const rows =
    Object.entries(
      counts
    )
      .sort(
        (a, b) =>
          b[1] -
          a[1]
      )
      .slice(
        0,
        10
      );


  if (!rows.length) {

    topPages.innerHTML = `

      <p class="note">
        No page activity yet.
      </p>

    `;


    return;

  }


  topPages.innerHTML =
    rows
      .map(
        ([page, count]) => `

          <div class="analytics-row">

            <span>
              ${escapeHtml(page)}
            </span>

            <strong>
              ${count.toLocaleString()}
            </strong>

          </div>

        `
      )
      .join("");

}


// =====================================================
// COUNTRY FLAG
// =====================================================

function countryFlag(
  code
) {

  if (
    !code ||
    code.length !==
    2
  ) {

    return "🌎";

  }


  return code
    .toUpperCase()
    .replace(

      /./g,

      character =>
        String.fromCodePoint(

          127397 +
          character.charCodeAt()

        )

    );

}


// =====================================================
// COUNTRIES
// =====================================================

function renderCountries(
  views
) {

  if (!countryAnalytics) {

    return;

  }


  const countries =
    {};


  views.forEach(
    view => {

      const name =
        view.country_name ||
        "Unknown";


      if (!countries[name]) {

        countries[name] = {

          count:
            0,

          code:
            view.country_code ||
            ""

        };

      }


      countries[name].count +=
        1;

    }
  );


  const rows =
    Object.entries(
      countries
    )
      .sort(
        (a, b) =>
          b[1].count -
          a[1].count
      )
      .slice(
        0,
        10
      );


  if (!rows.length) {

    countryAnalytics.innerHTML = `

      <p class="note">
        No country information yet.
      </p>

    `;


    return;

  }


  const total =
    views.length ||
    1;


  countryAnalytics.innerHTML =
    rows
      .map(
        ([country, data]) => {


          const percentage =
            Math.round(

              (
                data.count /
                total
              )
              *
              100

            );


          return `

            <div class="analytics-country">

              <div class="analytics-country-top">

                <span>

                  ${countryFlag(
                    data.code
                  )}

                  ${escapeHtml(
                    country
                  )}

                </span>


                <strong>

                  ${data.count}

                  <small>
                    ${percentage}%
                  </small>

                </strong>

              </div>


              <div class="analytics-bar">

                <span
                  style="width:${percentage}%"
                ></span>

              </div>

            </div>

          `;

        }
      )
      .join("");

}


// =====================================================
// TRAFFIC SOURCES
// =====================================================

function renderTrafficSources(
  views
) {

  if (!trafficSources) {

    return;

  }


  const counts =
    {};


  views.forEach(
    view => {

      const source =
        view.source ||
        "Direct";


      counts[source] =
        (
          counts[source] ||
          0
        )
        +
        1;

    }
  );


  const rows =
    Object.entries(
      counts
    )
      .sort(
        (a, b) =>
          b[1] -
          a[1]
      )
      .slice(
        0,
        10
      );


  if (!rows.length) {

    trafficSources.innerHTML = `

      <p class="note">
        No traffic data yet.
      </p>

    `;


    return;

  }


  trafficSources.innerHTML =
    rows
      .map(
        ([source, count]) => `

          <div class="analytics-row">

            <span>
              ${escapeHtml(
                source
              )}
            </span>

            <strong>
              ${count}
            </strong>

          </div>

        `
      )
      .join("");

}


// =====================================================
// RECENT VISITS
// =====================================================

function renderRecentVisits(
  views
) {

  if (!recentVisits) {

    return;

  }


  const recent =
    views.slice(
      0,
      10
    );


  if (!recent.length) {

    recentVisits.innerHTML = `

      <p class="note">
        No visits yet.
      </p>

    `;


    return;

  }


  recentVisits.innerHTML =
    recent
      .map(
        view => `

          <div class="analytics-visit">

            <div>

              <strong>

                ${escapeHtml(
                  view.page ||
                  "Unknown"
                )}

              </strong>


              <span>

                ${countryFlag(
                  view.country_code
                )}

                ${escapeHtml(
                  view.country_name ||
                  "Unknown"
                )}

              </span>

            </div>


            <small>

              ${escapeHtml(
                formatDate(
                  view.created_at
                )
              )}

            </small>

          </div>

        `
      )
      .join("");

}


// =====================================================
// INQUIRY COUNTS
// =====================================================

async function loadInquiryCounts() {

  if (!accessToken) {

    return;

  }


  try {

    const inquiries =
      await adminRequest(

        "contact_inquiries?" +
        "select=id,status"

      );


    const list =
      Array.isArray(
        inquiries
      )
        ? inquiries
        : [];


    if (newInquiryCount) {

      newInquiryCount.textContent =
        list.filter(
          inquiry =>
            inquiry.status ===
            "new"
        ).length;

    }


    if (contactedInquiryCount) {

      contactedInquiryCount.textContent =
        list.filter(
          inquiry =>
            inquiry.status ===
            "contacted"
        ).length;

    }


    if (closedInquiryCount) {

      closedInquiryCount.textContent =
        list.filter(
          inquiry =>
            inquiry.status ===
            "closed"
        ).length;

    }


  } catch (error) {

    console.error(
      "Inquiry counts:",
      error
    );

  }

}


// =====================================================
// LOAD INQUIRIES
// =====================================================

async function loadInquiries() {

  if (
    !accessToken ||
    !inquiryList
  ) {

    return;

  }


  inquiryList.innerHTML = `

    <p class="note">
      Loading inquiries...
    </p>

  `;


  let endpoint =

    "contact_inquiries?" +

    "select=" +

    "id," +
    "name," +
    "email," +
    "phone," +
    "business," +
    "service," +
    "budget," +
    "timeline," +
    "message," +
    "status," +
    "created_at" +

    "&order=created_at.desc";


  if (
    currentInquiryFilter !==
    "all"
  ) {

    endpoint +=

      `&status=eq.${encodeURIComponent(
        currentInquiryFilter
      )}`;

  }


  try {

    const inquiries =
      await adminRequest(
        endpoint
      );


    renderInquiries(
      inquiries || []
    );


  } catch (error) {

    console.error(
      "Inquiries:",
      error
    );


    inquiryList.innerHTML = `

      <p class="note">
        Unable to load inquiries.
      </p>

    `;

  }

}


// =====================================================
// RENDER INQUIRIES
// =====================================================

function renderInquiries(
  inquiries
) {

  if (!inquiryList) {

    return;

  }


  if (
    !Array.isArray(inquiries) ||
    !inquiries.length
  ) {

    inquiryList.innerHTML = `

      <p class="note">
        No ${escapeHtml(
          currentInquiryFilter
        )} inquiries found.
      </p>

    `;


    return;

  }


  inquiryList.innerHTML =
    inquiries
      .map(
        inquiry => `

          <article class="admin-inquiry-card">

            <div class="admin-inquiry-top">

              <div>

                <h3>

                  ${escapeHtml(
                    inquiry.name
                  )}

                </h3>


                <a
                  class="inquiry-email"
                  href="mailto:${escapeHtml(
                    inquiry.email
                  )}"
                >

                  ${escapeHtml(
                    inquiry.email
                  )}

                </a>

              </div>


              <span
                class="
                  admin-status
                  status-${escapeHtml(
                    inquiry.status
                  )}
                "
              >

                ${escapeHtml(
                  inquiry.status
                )}

              </span>

            </div>


            <div class="admin-inquiry-details">

              <div class="admin-inquiry-field">

                <strong>
                  Business
                </strong>

                ${escapeHtml(
                  inquiry.business ||
                  "—"
                )}

              </div>


              <div class="admin-inquiry-field">

                <strong>
                  Phone
                </strong>

                ${escapeHtml(
                  inquiry.phone ||
                  "—"
                )}

              </div>


              <div class="admin-inquiry-field">

                <strong>
                  Service
                </strong>

                ${escapeHtml(
                  inquiry.service ||
                  "—"
                )}

              </div>


              <div class="admin-inquiry-field">

                <strong>
                  Budget
                </strong>

                ${escapeHtml(
                  inquiry.budget ||
                  "—"
                )}

              </div>


              <div class="admin-inquiry-field">

                <strong>
                  Timeline
                </strong>

                ${escapeHtml(
                  inquiry.timeline ||
                  "—"
                )}

              </div>


              <div class="admin-inquiry-field">

                <strong>
                  Submitted
                </strong>

                ${escapeHtml(
                  formatDate(
                    inquiry.created_at
                  )
                )}

              </div>

            </div>


            <div class="admin-inquiry-message">

              <strong>
                Project details
              </strong>

              <p>

                ${escapeHtml(
                  inquiry.message ||
                  ""
                )}

              </p>

            </div>


            <div class="admin-actions">

              ${
                inquiry.status !==
                "contacted"

                  ? `

                    <button
                      class="btn"
                      type="button"
                      data-inquiry-action="contacted"
                      data-inquiry-id="${inquiry.id}"
                    >
                      Mark Contacted
                    </button>

                  `

                  : ""
              }


              ${
                inquiry.status !==
                "closed"

                  ? `

                    <button
                      class="btn"
                      type="button"
                      data-inquiry-action="closed"
                      data-inquiry-id="${inquiry.id}"
                    >
                      Close
                    </button>

                  `

                  : ""
              }


              <a
                class="btn btn-primary"
                href="mailto:${escapeHtml(
                  inquiry.email
                )}"
              >
                Email Client
              </a>


              <button
                class="btn admin-delete"
                type="button"
                data-inquiry-action="delete"
                data-inquiry-id="${inquiry.id}"
              >
                Delete
              </button>

            </div>

          </article>

        `
      )
      .join("");


  document
    .querySelectorAll(
      "[data-inquiry-action]"
    )
    .forEach(
      button => {

        button.addEventListener(

          "click",

          handleInquiryAction

        );

      }
    );

}


// =====================================================
// INQUIRY ACTION
// =====================================================

async function handleInquiryAction(
  event
) {

  const button =
    event.currentTarget;


  const id =
    button.dataset.inquiryId;


  const action =
    button.dataset.inquiryAction;


  if (
    !id ||
    !action
  ) {

    return;

  }


  if (
    action ===
    "delete"
  ) {

    if (
      !window.confirm(
        "Delete this inquiry permanently?"
      )
    ) {

      return;

    }


    await deleteInquiry(
      id
    );


    return;

  }


  await updateInquiryStatus(

    id,

    action

  );

}


// =====================================================
// UPDATE INQUIRY STATUS
// =====================================================

async function updateInquiryStatus(
  id,
  status
) {

  try {

    await adminRequest(

      `contact_inquiries?id=eq.${encodeURIComponent(
        id
      )}`,

      {

        method:
          "PATCH",

        headers: {

          Prefer:
            "return=minimal"

        },

        body:
          JSON.stringify({

            status

          })

      }

    );


    showMessage(

      inquiryActionMessage,

      status ===
      "contacted"

        ? "Inquiry marked as contacted."

        : "Inquiry closed."

    );


    await loadInquiryCounts();


    await loadInquiries();


  } catch (error) {

    console.error(
      "Inquiry update:",
      error
    );


    showMessage(

      inquiryActionMessage,

      "Unable to update inquiry."

    );

  }

}


// =====================================================
// DELETE INQUIRY
// =====================================================

async function deleteInquiry(
  id
) {

  try {

    await adminRequest(

      `contact_inquiries?id=eq.${encodeURIComponent(
        id
      )}`,

      {

        method:
          "DELETE",

        headers: {

          Prefer:
            "return=minimal"

        }

      }

    );


    showMessage(

      inquiryActionMessage,

      "Inquiry deleted."

    );


    await loadInquiryCounts();


    await loadInquiries();


  } catch (error) {

    console.error(
      "Inquiry delete:",
      error
    );


    showMessage(

      inquiryActionMessage,

      "Unable to delete inquiry."

    );

  }

}


// =====================================================
// INQUIRY FILTERS
// =====================================================

inquiryFilterButtons.forEach(
  button => {

    button.addEventListener(

      "click",

      async () => {


        inquiryFilterButtons.forEach(
          item =>
            item.classList.remove(
              "active"
            )
        );


        button.classList.add(
          "active"
        );


        currentInquiryFilter =
          button.dataset.inquiryStatus ||
          "new";


        await loadInquiries();

      }

    );

  }
);


// =====================================================
// REVIEW COUNTS
// =====================================================

async function loadReviewCounts() {

  if (!accessToken) {

    return;

  }


  try {

    const reviews =
      await adminRequest(

        "reviews?" +
        "select=id,status"

      );


    const list =
      Array.isArray(
        reviews
      )
        ? reviews
        : [];


    if (pendingCount) {

      pendingCount.textContent =
        list.filter(
          review =>
            review.status ===
            "pending"
        ).length;

    }


    if (approvedCount) {

      approvedCount.textContent =
        list.filter(
          review =>
            review.status ===
            "approved"
        ).length;

    }


    if (rejectedCount) {

      rejectedCount.textContent =
        list.filter(
          review =>
            review.status ===
            "rejected"
        ).length;

    }


  } catch (error) {

    console.error(
      "Review counts:",
      error
    );

  }

}


// =====================================================
// LOAD REVIEWS
// =====================================================

async function loadReviews() {

  if (
    !accessToken ||
    !reviewList
  ) {

    return;

  }


  reviewList.innerHTML = `

    <p class="note">
      Loading reviews...
    </p>

  `;


  let endpoint =

    "reviews?" +

    "select=" +

    "id," +
    "name," +
    "business," +
    "rating," +
    "text," +
    "status," +
    "created_at" +

    "&order=created_at.desc";


  if (
    currentReviewFilter !==
    "all"
  ) {

    endpoint +=

      `&status=eq.${encodeURIComponent(
        currentReviewFilter
      )}`;

  }


  try {

    const reviews =
      await adminRequest(
        endpoint
      );


    renderReviews(
      reviews || []
    );


  } catch (error) {

    console.error(
      "Reviews:",
      error
    );


    reviewList.innerHTML = `

      <p class="note">
        Unable to load reviews.
      </p>

    `;

  }

}


// =====================================================
// RENDER REVIEWS
// =====================================================

function renderReviews(
  reviews
) {

  if (!reviewList) {

    return;

  }


  if (
    !Array.isArray(reviews) ||
    !reviews.length
  ) {

    reviewList.innerHTML = `

      <p class="note">
        No ${escapeHtml(
          currentReviewFilter
        )} reviews found.
      </p>

    `;


    return;

  }


  reviewList.innerHTML =
    reviews
      .map(
        review => {


          const rating =
            Math.max(

              1,

              Math.min(

                5,

                Number(
                  review.rating
                )

              )

            );


          return `

            <article class="admin-review-card">

              <div class="admin-review-top">

                <div>

                  <div class="stars">

                    ${"★".repeat(
                      rating
                    )}

                  </div>


                  <h3>

                    ${escapeHtml(
                      review.name
                    )}

                  </h3>


                  <p class="note">

                    ${escapeHtml(
                      review.business ||
                      "Client"
                    )}

                  </p>

                </div>


                <span
                  class="
                    admin-status
                    status-${escapeHtml(
                      review.status
                    )}
                  "
                >

                  ${escapeHtml(
                    review.status
                  )}

                </span>

              </div>


              <p>

                “${escapeHtml(
                  review.text
                )}”

              </p>


              <p class="note">

                ${escapeHtml(
                  formatDate(
                    review.created_at
                  )
                )}

              </p>


              <div class="admin-actions">

                ${
                  review.status !==
                  "approved"

                    ? `

                      <button
                        class="btn"
                        type="button"
                        data-review-action="approve"
                        data-review-id="${review.id}"
                      >
                        Approve
                      </button>

                    `

                    : ""
                }


                ${
                  review.status !==
                  "rejected"

                    ? `

                      <button
                        class="btn"
                        type="button"
                        data-review-action="reject"
                        data-review-id="${review.id}"
                      >
                        Reject
                      </button>

                    `

                    : ""
                }


                <button
                  class="btn admin-delete"
                  type="button"
                  data-review-action="delete"
                  data-review-id="${review.id}"
                >
                  Delete
                </button>

              </div>

            </article>

          `;

        }
      )
      .join("");


  document
    .querySelectorAll(
      "[data-review-action]"
    )
    .forEach(
      button => {

        button.addEventListener(

          "click",

          handleReviewAction

        );

      }
    );

}


// =====================================================
// REVIEW ACTION
// =====================================================

async function handleReviewAction(
  event
) {

  const button =
    event.currentTarget;


  const id =
    button.dataset.reviewId;


  const action =
    button.dataset.reviewAction;


  if (
    !id ||
    !action
  ) {

    return;

  }


  if (
    action ===
    "delete"
  ) {

    if (
      !window.confirm(
        "Delete this review permanently?"
      )
    ) {

      return;

    }


    await deleteReview(
      id
    );


    return;

  }


  const status =
    action ===
    "approve"

      ? "approved"

      : "rejected";


  await updateReviewStatus(

    id,

    status

  );

}


// =====================================================
// UPDATE REVIEW
// =====================================================

async function updateReviewStatus(
  id,
  status
) {

  try {

    await adminRequest(

      `reviews?id=eq.${encodeURIComponent(
        id
      )}`,

      {

        method:
          "PATCH",

        headers: {

          Prefer:
            "return=minimal"

        },

        body:
          JSON.stringify({

            status

          })

      }

    );


    showMessage(

      actionMessage,

      status ===
      "approved"

        ? "Review approved."

        : "Review rejected."

    );


    await loadReviewCounts();


    await loadReviews();


  } catch (error) {

    console.error(
      "Review update:",
      error
    );


    showMessage(

      actionMessage,

      "Unable to update review."

    );

  }

}


// =====================================================
// DELETE REVIEW
// =====================================================

async function deleteReview(
  id
) {

  try {

    await adminRequest(

      `reviews?id=eq.${encodeURIComponent(
        id
      )}`,

      {

        method:
          "DELETE",

        headers: {

          Prefer:
            "return=minimal"

        }

      }

    );


    showMessage(

      actionMessage,

      "Review deleted."

    );


    await loadReviewCounts();


    await loadReviews();


  } catch (error) {

    console.error(
      "Review delete:",
      error
    );


    showMessage(

      actionMessage,

      "Unable to delete review."

    );

  }

}


// =====================================================
// REVIEW FILTERS
// =====================================================

reviewFilterButtons.forEach(
  button => {

    button.addEventListener(

      "click",

      async () => {


        reviewFilterButtons.forEach(
          item =>
            item.classList.remove(
              "active"
            )
        );


        button.classList.add(
          "active"
        );


        currentReviewFilter =
          button.dataset.status ||
          "pending";


        await loadReviews();

      }

    );

  }
);


// =====================================================
// PRICING MESSAGE
// =====================================================

function showPricingMessage(
  message
) {

  if (!pricingAdminMessage) {

    return;

  }


  pricingAdminMessage.textContent =
    message;


  pricingAdminMessage.style.display =
    "block";


  window.setTimeout(
    () => {

      pricingAdminMessage.style.display =
        "none";

    },
    3500
  );

}


// =====================================================
// LOAD ALL ADMIN PRICING
// =====================================================

async function loadAdminPricing() {

  await Promise.allSettled([

    loadAdminServicePricing(),

    loadAdminRegionPricing()

  ]);


  await loadAdminOverrides();

}


// =====================================================
// LOAD USD MASTER SERVICE PRICES
// =====================================================

async function loadAdminServicePricing() {

  if (!adminServicePricing) {

    return;

  }


  adminServicePricing.innerHTML = `

    <p class="note">
      Loading service prices...
    </p>

  `;


  try {

    adminPricingServices =
      await adminRequest(

        "services_pricing?" +

        "select=" +

        "id," +
        "service_code," +
        "service_name," +
        "base_price_usd," +
        "price_type," +
        "active" +

        "&order=id.asc"

      );


    if (
      !Array.isArray(
        adminPricingServices
      )
    ) {

      adminPricingServices =
        [];

    }


    renderAdminServicePricing();


    populateOverrideServices();


  } catch (error) {

    console.error(
      "Service pricing:",
      error
    );


    adminServicePricing.innerHTML = `

      <p class="note">
        Unable to load service pricing.
      </p>

    `;

  }

}


// =====================================================
// RENDER USD SERVICE PRICES
// =====================================================

function renderAdminServicePricing() {

  if (!adminServicePricing) {

    return;

  }


  if (
    !adminPricingServices.length
  ) {

    adminServicePricing.innerHTML = `

      <p class="note">
        No services found.
      </p>

    `;


    return;

  }


  adminServicePricing.innerHTML =
    adminPricingServices
      .map(
        service => `

          <article class="pricing-admin-card">

            <span class="pricing-admin-code">

              ${escapeHtml(
                service.service_code
              )}

            </span>


            <h3>

              ${escapeHtml(
                service.service_name
              )}

            </h3>


            <label>
              Base Price (USD)
            </label>


            <input
              type="number"
              min="0"
              step="0.01"
              value="${Number(
                service.base_price_usd
              )}"
              data-service-price-id="${service.id}"
            >


            <label>
              Display Type
            </label>


            <select
              data-service-type-id="${service.id}"
            >

              <option
                value="starting_at"
                ${
                  service.price_type ===
                  "starting_at"

                    ? "selected"

                    : ""
                }
              >
                Starting at
              </option>


              <option
                value="fixed"
                ${
                  service.price_type ===
                  "fixed"

                    ? "selected"

                    : ""
                }
              >
                Fixed price
              </option>


              <option
                value="contact"
                ${
                  service.price_type ===
                  "contact"

                    ? "selected"

                    : ""
                }
              >
                Contact for pricing
              </option>

            </select>


            <button
              class="btn btn-primary"
              type="button"
              data-save-service="${service.id}"
            >
              Save Price
            </button>

          </article>

        `
      )
      .join("");


  document
    .querySelectorAll(
      "[data-save-service]"
    )
    .forEach(
      button => {

        button.addEventListener(

          "click",

          saveAdminServicePricing

        );

      }
    );

}


// =====================================================
// SAVE USD SERVICE PRICE
// =====================================================

async function saveAdminServicePricing(
  event
) {

  const button =
    event.currentTarget;


  const id =
    button.dataset.saveService;


  const priceInput =
    document.querySelector(
      `[data-service-price-id="${id}"]`
    );


  const typeInput =
    document.querySelector(
      `[data-service-type-id="${id}"]`
    );


  if (
    !priceInput ||
    !typeInput
  ) {

    return;

  }


  const price =
    Number(
      priceInput.value
    );


  if (
    !Number.isFinite(
      price
    ) ||
    price <
    0
  ) {

    showPricingMessage(
      "Enter a valid USD price."
    );


    return;

  }


  button.disabled =
    true;


  button.textContent =
    "Saving...";


  try {

    await adminRequest(

      `services_pricing?id=eq.${encodeURIComponent(
        id
      )}`,

      {

        method:
          "PATCH",

        headers: {

          Prefer:
            "return=minimal"

        },

        body:
          JSON.stringify({

            base_price_usd:
              price,

            price_type:
              typeInput.value,

            updated_at:
              new Date()
                .toISOString()

          })

      }

    );


    showPricingMessage(
      "USD master price updated."
    );


    await loadAdminServicePricing();


  } catch (error) {

    console.error(
      "Service price update:",
      error
    );


    showPricingMessage(
      "Unable to update service price."
    );


  } finally {

    button.disabled =
      false;


    button.textContent =
      "Save Price";

  }

}


// =====================================================
// LOAD REGIONAL PRICING
// =====================================================

async function loadAdminRegionPricing() {

  if (!adminRegionPricing) {

    return;

  }


  adminRegionPricing.innerHTML = `

    <p class="note">
      Loading countries...
    </p>

  `;


  try {

    adminPricingRegions =
      await adminRequest(

        "pricing_regions?" +

        "select=" +

        "country_code," +
        "country_name," +
        "currency_code," +
        "currency_symbol," +
        "exchange_rate," +
        "market_multiplier," +
        "active" +

        "&order=country_name.asc"

      );


    if (
      !Array.isArray(
        adminPricingRegions
      )
    ) {

      adminPricingRegions =
        [];

    }


    renderAdminRegions();


    populateOverrideCountries();


  } catch (error) {

    console.error(
      "Regional pricing:",
      error
    );


    adminRegionPricing.innerHTML = `

      <p class="note">
        Unable to load countries.
      </p>

    `;

  }

}


// =====================================================
// RENDER REGIONAL PRICING
// =====================================================

function renderAdminRegions() {

  if (!adminRegionPricing) {

    return;

  }


  if (
    !adminPricingRegions.length
  ) {

    adminRegionPricing.innerHTML = `

      <p class="note">
        No pricing regions found.
      </p>

    `;


    return;

  }


  adminRegionPricing.innerHTML =
    adminPricingRegions
      .map(
        region => `

          <article class="pricing-region-row">

            <div class="pricing-region-country">

              <strong>

                ${escapeHtml(
                  region.country_name
                )}

              </strong>


              <span>

                ${escapeHtml(
                  region.country_code
                )}

              </span>

            </div>


            <div>

              <label>
                Currency
              </label>


              <input
                type="text"
                maxlength="3"
                value="${escapeHtml(
                  region.currency_code
                )}"
                data-region-currency="${escapeHtml(
                  region.country_code
                )}"
              >

            </div>


            <div>

              <label>
                Symbol
              </label>


              <input
                type="text"
                maxlength="8"
                value="${escapeHtml(
                  region.currency_symbol
                )}"
                data-region-symbol="${escapeHtml(
                  region.country_code
                )}"
              >

            </div>


            <div>

              <label>
                USD Exchange Rate
              </label>


              <input
                type="number"
                min="0.000001"
                step="0.000001"
                value="${Number(
                  region.exchange_rate
                )}"
                data-region-exchange-rate="${escapeHtml(
                  region.country_code
                )}"
              >

            </div>


            <div>

              <label>
                Market Multiplier
              </label>


              <input
                type="number"
                min="0.0001"
                step="0.0001"
                value="${Number(
                  region.market_multiplier
                )}"
                data-region-market-multiplier="${escapeHtml(
                  region.country_code
                )}"
              >

            </div>


            <button
              class="btn"
              type="button"
              data-save-region="${escapeHtml(
                region.country_code
              )}"
            >
              Save
            </button>

          </article>

        `
      )
      .join("");


  document
    .querySelectorAll(
      "[data-save-region]"
    )
    .forEach(
      button => {

        button.addEventListener(

          "click",

          saveAdminRegion

        );

      }
    );

}


// =====================================================
// SAVE REGIONAL PRICING
// =====================================================

async function saveAdminRegion(
  event
) {

  const button =
    event.currentTarget;


  const code =
    button.dataset.saveRegion;


  if (!code) {

    return;

  }


  const currencyInput =
    document.querySelector(
      `[data-region-currency="${code}"]`
    );


  const symbolInput =
    document.querySelector(
      `[data-region-symbol="${code}"]`
    );


  const exchangeRateInput =
    document.querySelector(
      `[data-region-exchange-rate="${code}"]`
    );


  const marketMultiplierInput =
    document.querySelector(
      `[data-region-market-multiplier="${code}"]`
    );


  if (
    !currencyInput ||
    !symbolInput ||
    !exchangeRateInput ||
    !marketMultiplierInput
  ) {

    showPricingMessage(
      "Unable to find the regional pricing fields."
    );


    return;

  }


  const currency =
    currencyInput.value
      .trim()
      .toUpperCase();


  const symbol =
    symbolInput.value
      .trim();


  const exchangeRate =
    Number(
      exchangeRateInput.value
    );


  const marketMultiplier =
    Number(
      marketMultiplierInput.value
    );


  if (
    currency.length !==
    3
  ) {

    showPricingMessage(
      "Currency code must contain exactly 3 characters."
    );


    return;

  }


  if (!symbol) {

    showPricingMessage(
      "Currency symbol is required."
    );


    return;

  }


  if (
    !Number.isFinite(
      exchangeRate
    ) ||
    exchangeRate <=
    0
  ) {

    showPricingMessage(
      "Exchange rate must be greater than zero."
    );


    return;

  }


  if (
    !Number.isFinite(
      marketMultiplier
    ) ||
    marketMultiplier <=
    0
  ) {

    showPricingMessage(
      "Market multiplier must be greater than zero."
    );


    return;

  }


  button.disabled =
    true;


  button.textContent =
    "Saving...";


  try {

    await adminRequest(

      `pricing_regions?country_code=eq.${encodeURIComponent(
        code
      )}`,

      {

        method:
          "PATCH",

        headers: {

          Prefer:
            "return=minimal"

        },

        body:
          JSON.stringify({

            currency_code:
              currency,

            currency_symbol:
              symbol,

            exchange_rate:
              exchangeRate,

            market_multiplier:
              marketMultiplier,

            updated_at:
              new Date()
                .toISOString()

          })

      }

    );


    showPricingMessage(

      `${code} regional pricing updated.`

    );


    await loadAdminRegionPricing();


    await loadAdminOverrides();


  } catch (error) {

    console.error(
      "Regional pricing update:",
      error
    );


    showPricingMessage(
      "Unable to update country pricing."
    );


  } finally {

    button.disabled =
      false;


    button.textContent =
      "Save";

  }

}


// =====================================================
// POPULATE OVERRIDE SERVICES
// =====================================================

function populateOverrideServices() {

  if (!overrideService) {

    return;

  }


  overrideService.innerHTML =
    adminPricingServices
      .map(
        service => `

          <option
            value="${escapeHtml(
              service.service_code
            )}"
          >

            ${escapeHtml(
              service.service_name
            )}

          </option>

        `
      )
      .join("");

}


// =====================================================
// POPULATE OVERRIDE COUNTRIES
// =====================================================

function populateOverrideCountries() {

  if (!overrideCountry) {

    return;

  }


  overrideCountry.innerHTML =
    adminPricingRegions
      .map(
        region => `

          <option
            value="${escapeHtml(
              region.country_code
            )}"
          >

            ${escapeHtml(
              region.country_name
            )}

            (${escapeHtml(
              region.currency_code
            )})

          </option>

        `
      )
      .join("");

}


// =====================================================
// SAVE COUNTRY-SPECIFIC OVERRIDE
// =====================================================

saveOverrideButton?.addEventListener(

  "click",

  async () => {


    const serviceCode =
      overrideService
        ?.value;


    const countryCode =
      overrideCountry
        ?.value;


    const price =
      Number(
        overridePrice
          ?.value
      );


    if (
      !serviceCode ||
      !countryCode ||
      !Number.isFinite(
        price
      ) ||
      price <
      0
    ) {

      showPricingMessage(
        "Enter a valid country-specific price."
      );


      return;

    }


    saveOverrideButton.disabled =
      true;


    saveOverrideButton.textContent =
      "Saving...";


    try {

      await adminRequest(

        "pricing_overrides?" +
        "on_conflict=service_code,country_code",

        {

          method:
            "POST",

          headers: {

            Prefer:
              "resolution=merge-duplicates,return=minimal"

          },

          body:
            JSON.stringify({

              service_code:
                serviceCode,

              country_code:
                countryCode,

              local_price:
                price,

              updated_at:
                new Date()
                  .toISOString()

            })

        }

      );


      if (overridePrice) {

        overridePrice.value =
          "";

      }


      showPricingMessage(
        "Country-specific price saved."
      );


      await loadAdminOverrides();


    } catch (error) {

      console.error(
        "Override save:",
        error
      );


      showPricingMessage(
        "Unable to save country-specific price."
      );


    } finally {

      saveOverrideButton.disabled =
        false;


      saveOverrideButton.textContent =
        "Save Override";

    }

  }

);


// =====================================================
// LOAD PRICE OVERRIDES
// =====================================================

async function loadAdminOverrides() {

  if (!adminPricingOverrides) {

    return;

  }


  adminPricingOverrides.innerHTML = `

    <p class="note">
      Loading overrides...
    </p>

  `;


  try {

    const overrides =
      await adminRequest(

        "pricing_overrides?" +

        "select=" +

        "id," +
        "service_code," +
        "country_code," +
        "local_price," +
        "updated_at" +

        "&order=country_code.asc"

      );


    renderAdminOverrides(

      Array.isArray(
        overrides
      )
        ? overrides
        : []

    );


  } catch (error) {

    console.error(
      "Overrides:",
      error
    );


    adminPricingOverrides.innerHTML = `

      <p class="note">
        Unable to load overrides.
      </p>

    `;

  }

}


// =====================================================
// RENDER OVERRIDES
// =====================================================

function renderAdminOverrides(
  overrides
) {

  if (!adminPricingOverrides) {

    return;

  }


  if (!overrides.length) {

    adminPricingOverrides.innerHTML = `

      <p class="note">
        No country-specific prices yet.
      </p>

    `;


    return;

  }


  adminPricingOverrides.innerHTML =
    overrides
      .map(
        item => {


          const service =
            adminPricingServices.find(
              serviceItem =>
                serviceItem.service_code ===
                item.service_code
            );


          const region =
            adminPricingRegions.find(
              regionItem =>
                regionItem.country_code ===
                item.country_code
            );


          return `

            <article class="pricing-override-row">

              <div>

                <strong>

                  ${escapeHtml(
                    service?.service_name ||
                    item.service_code
                  )}

                </strong>

              </div>


              <div>

                ${escapeHtml(
                  region?.country_name ||
                  item.country_code
                )}

              </div>


              <div>

                ${escapeHtml(
                  region?.currency_symbol ||
                  ""
                )}

                ${Number(
                  item.local_price
                ).toLocaleString()}

              </div>


              <div>

                ${escapeHtml(
                  region?.currency_code ||
                  ""
                )}

              </div>


              <button
                class="btn admin-delete"
                type="button"
                data-delete-override="${item.id}"
              >
                Delete
              </button>

            </article>

          `;

        }
      )
      .join("");


  document
    .querySelectorAll(
      "[data-delete-override]"
    )
    .forEach(
      button => {

        button.addEventListener(

          "click",

          deletePricingOverride

        );

      }
    );

}


// =====================================================
// DELETE PRICE OVERRIDE
// =====================================================

async function deletePricingOverride(
  event
) {

  const button =
    event.currentTarget;


  const id =
    button.dataset.deleteOverride;


  if (!id) {

    return;

  }


  if (
    !window.confirm(
      "Delete this country-specific price?"
    )
  ) {

    return;

  }


  try {

    await adminRequest(

      `pricing_overrides?id=eq.${encodeURIComponent(
        id
      )}`,

      {

        method:
          "DELETE",

        headers: {

          Prefer:
            "return=minimal"

        }

      }

    );


    showPricingMessage(
      "Price override deleted."
    );


    await loadAdminOverrides();


  } catch (error) {

    console.error(
      "Override delete:",
      error
    );


    showPricingMessage(
      "Unable to delete price override."
    );

  }

}


// =====================================================
// TOKEN VALIDATION
// =====================================================

async function tokenIsValid() {

  if (!accessToken) {

    return false;

  }


  try {

    const response =
      await fetch(

        `${SUPABASE_URL}/auth/v1/user`,

        {

          headers: {

            apikey:
              SUPABASE_PUBLISHABLE_KEY,

            Authorization:
              `Bearer ${accessToken}`

          }

        }

      );


    return response.ok;


  } catch {

    return false;

  }

}


// =====================================================
// LOGOUT
// =====================================================

logoutButton?.addEventListener(

  "click",

  async () => {


    try {

      if (accessToken) {

        await fetch(

          `${SUPABASE_URL}/auth/v1/logout`,

          {

            method:
              "POST",

            headers: {

              apikey:
                SUPABASE_PUBLISHABLE_KEY,

              Authorization:
                `Bearer ${accessToken}`

            }

          }

        );

      }


    } catch (error) {

      console.warn(
        "Logout:",
        error
      );

    }


    sessionStorage.removeItem(
      "doanaAdminToken"
    );


    accessToken =
      null;


    if (dashboard) {

      dashboard.style.display =
        "none";

    }


    if (loginSection) {

      loginSection.style.display =
        "block";

    }


    loginForm
      ?.reset();

  }

);


// =====================================================
// RESTORE ADMIN SESSION
// =====================================================

async function restoreAdminSession() {

  const storedToken =
    sessionStorage.getItem(
      "doanaAdminToken"
    );


  if (!storedToken) {

    return;

  }


  accessToken =
    storedToken;


  const valid =
    await tokenIsValid();


  if (!valid) {

    sessionStorage.removeItem(
      "doanaAdminToken"
    );


    accessToken =
      null;


    return;

  }


  const admin =
    await verifyAdmin();


  if (!admin) {

    sessionStorage.removeItem(
      "doanaAdminToken"
    );


    accessToken =
      null;


    return;

  }


  await showDashboard();

}


// =====================================================
// START
// =====================================================

restoreAdminSession();