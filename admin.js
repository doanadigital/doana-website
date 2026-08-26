// =====================================================
// DOANA DIGITAL
// ADMIN DASHBOARD
// =====================================================


// =====================================================
// SUPABASE
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
  document.getElementById("adminLogin");

const dashboard =
  document.getElementById("adminDashboard");

const loginForm =
  document.getElementById("adminLoginForm");

const loginButton =
  document.getElementById("adminLoginButton");

const loginMessage =
  document.getElementById("adminLoginMessage");

const forgotPasswordButton =
  document.getElementById("forgotPassword");

const resetMessage =
  document.getElementById("resetMessage");

const logoutButton =
  document.getElementById("adminLogout");


// =====================================================
// MAIN TABS
// =====================================================

const analyticsTab =
  document.getElementById("analyticsTab");

const inquiriesTab =
  document.getElementById("inquiriesTab");

const reviewsTab =
  document.getElementById("reviewsTab");

const pricingTab =
  document.getElementById("pricingTab");


const analyticsPanel =
  document.getElementById("analyticsPanel");

const inquiriesPanel =
  document.getElementById("inquiriesPanel");

const reviewsPanel =
  document.getElementById("reviewsPanel");

const pricingPanel =
  document.getElementById("pricingPanel");


// =====================================================
// ANALYTICS DOM
// =====================================================

const totalPageViews =
  document.getElementById("totalPageViews");

const uniqueVisitors =
  document.getElementById("uniqueVisitors");

const todayViews =
  document.getElementById("todayViews");

const weekViews =
  document.getElementById("weekViews");

const topPages =
  document.getElementById("topPages");

const countryAnalytics =
  document.getElementById("countryAnalytics");

const trafficSources =
  document.getElementById("trafficSources");

const recentVisits =
  document.getElementById("recentVisits");


// =====================================================
// INQUIRIES DOM
// =====================================================

const inquiryList =
  document.getElementById("adminInquiryList");

const inquiryActionMessage =
  document.getElementById("inquiryActionMessage");

const newInquiryCount =
  document.getElementById("newInquiryCount");

const contactedInquiryCount =
  document.getElementById("contactedInquiryCount");

const closedInquiryCount =
  document.getElementById("closedInquiryCount");

const inquiryFilterButtons =
  document.querySelectorAll(".inquiry-filter");


// =====================================================
// REVIEWS DOM
// =====================================================

const reviewList =
  document.getElementById("adminReviewList");

const actionMessage =
  document.getElementById("adminActionMessage");

const pendingCount =
  document.getElementById("pendingCount");

const approvedCount =
  document.getElementById("approvedCount");

const rejectedCount =
  document.getElementById("rejectedCount");

const reviewFilterButtons =
  document.querySelectorAll(".admin-filter");


// =====================================================
// PRICING DOM
// =====================================================

const adminServicePricing =
  document.getElementById("adminServicePricing");

const adminRegionPricing =
  document.getElementById("adminRegionPricing");

const adminPricingOverrides =
  document.getElementById("adminPricingOverrides");

const pricingAdminMessage =
  document.getElementById("pricingAdminMessage");

const overrideService =
  document.getElementById("overrideService");

const overrideCountry =
  document.getElementById("overrideCountry");

const overridePrice =
  document.getElementById("overridePrice");

const saveOverrideButton =
  document.getElementById("saveOverride");


// =====================================================
// STATE
// =====================================================

let accessToken = null;

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

  if (!element) return;

  element.textContent =
    message;

  element.style.display =
    "block";
}


function hideMessage(
  element
) {

  if (!element) return;

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
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]
  );
}


function formatDate(
  value
) {

  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleString();
}


// =====================================================
// LOGIN
// =====================================================

if (loginForm) {

  loginForm.addEventListener(
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
          .getElementById("adminEmail")
          .value
          .trim();


      const password =
        document
          .getElementById("adminPassword")
          .value;


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


      loginButton.disabled =
        true;

      loginButton.textContent =
        "Signing in...";


      try {

        const response =
          await fetch(

            `${SUPABASE_URL}/auth/v1/token?grant_type=password`,

            {
              method: "POST",

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


        const isAdmin =
          await verifyAdmin();


        if (!isAdmin) {

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
          "Admin login error:",
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

        loginButton.disabled =
          false;

        loginButton.textContent =
          "Sign In";
      }

    }
  );
}


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
      Array.isArray(admins) &&
      admins.length > 0
    );


  } catch (error) {

    console.error(
      "Admin verification error:",
      error
    );

    return false;
  }
}


// =====================================================
// FORGOT PASSWORD
// =====================================================

if (
  forgotPasswordButton
) {

  forgotPasswordButton.addEventListener(
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
          .getElementById("adminEmail")
          .value
          .trim();


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
              method: "POST",

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
            "RESET_FAILED"
          );
        }


        showMessage(
          resetMessage,
          "If this email belongs to the admin account, a password reset link has been sent."
        );


      } catch (error) {

        console.error(
          "Password reset error:",
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
}


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


  // Remove active tab
  tabs.forEach(
    tab => {

      if (tab) {

        tab.classList.remove(
          "active"
        );
      }

    }
  );


  // Hide all panels
  panels.forEach(
    panel => {

      if (panel) {

        panel.style.display =
          "none";
      }

    }
  );


  // ANALYTICS

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


  // INQUIRIES

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


  // REVIEWS

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


  // PRICING

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
// TAB EVENTS
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

    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/page_views?select=id,visitor_id,page,path,country_code,country_name,referrer,source,created_at&order=created_at.desc`,

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

      throw new Error(
        await response.text()
      );
    }


    const views =
      await response.json();


    renderAnalytics(
      views
    );


  } catch (error) {

    console.error(
      "Analytics loading error:",
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
      views.length.toLocaleString();
  }


  const visitorIds =
    views
      .map(
        view =>
          view.visitor_id
      )
      .filter(Boolean);


  const unique =
    new Set(
      visitorIds
    );


  if (uniqueVisitors) {

    uniqueVisitors.textContent =
      unique.size.toLocaleString();
  }


  const now =
    new Date();


  const todayStart =
    new Date(

      now.getFullYear(),

      now.getMonth(),

      now.getDate()

    );


  const todaysViews =
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
    );


  if (todayViews) {

    todayViews.textContent =
      todaysViews.length.toLocaleString();
  }


  const sevenDaysAgo =
    new Date();


  sevenDaysAgo.setDate(

    sevenDaysAgo.getDate() -
    7

  );


  const weeklyViews =
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
    );


  if (weekViews) {

    weekViews.textContent =
      weeklyViews.length.toLocaleString();
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
        ) + 1;

    }
  );


  const sorted =
    Object.entries(
      counts
    )
      .sort(
        (a,b) =>
          b[1] - a[1]
      )
      .slice(
        0,
        10
      );


  if (!sorted.length) {

    topPages.innerHTML = `
      <p class="note">
        No page activity yet.
      </p>
    `;

    return;
  }


  topPages.innerHTML =
    sorted.map(
      ([page,count]) => `

        <div class="analytics-row">

          <span>
            ${escapeHtml(page)}
          </span>

          <strong>
            ${count.toLocaleString()}
          </strong>

        </div>

      `
    ).join("");

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


  const counts =
    {};


  views.forEach(
    view => {

      const country =
        view.country_name ||
        "Unknown";


      if (!counts[country]) {

        counts[country] = {

          count: 0,

          code:
            view.country_code ||
            ""

        };

      }


      counts[country].count +=
        1;

    }
  );


  const sorted =
    Object.entries(
      counts
    )
      .sort(
        (a,b) =>
          b[1].count -
          a[1].count
      )
      .slice(
        0,
        10
      );


  const total =
    views.length ||
    1;


  if (!sorted.length) {

    countryAnalytics.innerHTML = `
      <p class="note">
        No country information yet.
      </p>
    `;

    return;
  }


  countryAnalytics.innerHTML =
    sorted.map(
      ([country,data]) => {


        const percentage =
          Math.round(

            (
              data.count /
              total
            ) *

            100

          );


        return `

          <div class="analytics-country">

            <div
              class="analytics-country-top"
            >

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
                style="
                  width:${percentage}%;
                "
              ></span>

            </div>

          </div>

        `;

      }
    ).join("");

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
        ) + 1;

    }
  );


  const sorted =
    Object.entries(
      counts
    )
      .sort(
        (a,b) =>
          b[1] - a[1]
      )
      .slice(
        0,
        10
      );


  if (!sorted.length) {

    trafficSources.innerHTML = `
      <p class="note">
        No traffic data yet.
      </p>
    `;

    return;
  }


  trafficSources.innerHTML =
    sorted.map(
      ([source,count]) => `

        <div class="analytics-row">

          <span>
            ${escapeHtml(source)}
          </span>

          <strong>
            ${count}
          </strong>

        </div>

      `
    ).join("");

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
    recent.map(
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
    ).join("");

}


// =====================================================
// INQUIRY COUNTS
// =====================================================

async function loadInquiryCounts() {

  if (!accessToken) {
    return;
  }


  try {

    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/contact_inquiries?select=id,status`,

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

      throw new Error(
        await response.text()
      );
    }


    const inquiries =
      await response.json();


    const newCount =
      inquiries.filter(
        inquiry =>
          inquiry.status ===
          "new"
      ).length;


    const contactedCount =
      inquiries.filter(
        inquiry =>
          inquiry.status ===
          "contacted"
      ).length;


    const closedCount =
      inquiries.filter(
        inquiry =>
          inquiry.status ===
          "closed"
      ).length;


    if (newInquiryCount) {

      newInquiryCount.textContent =
        newCount;
    }


    if (contactedInquiryCount) {

      contactedInquiryCount.textContent =
        contactedCount;
    }


    if (closedInquiryCount) {

      closedInquiryCount.textContent =
        closedCount;
    }


  } catch (error) {

    console.error(
      "Inquiry count error:",
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

    `${SUPABASE_URL}/rest/v1/contact_inquiries` +

    `?select=id,name,email,phone,business,service,budget,timeline,message,status,created_at` +

    `&order=created_at.desc`;


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

    const response =
      await fetch(

        endpoint,

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

      throw new Error(
        await response.text()
      );
    }


    const inquiries =
      await response.json();


    renderInquiries(
      inquiries
    );


  } catch (error) {

    console.error(
      "Unable to load inquiries:",
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
    inquiries.map(
      inquiry => `

        <article
          class="admin-inquiry-card"
        >

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
    ).join("");


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
// UPDATE INQUIRY
// =====================================================

async function updateInquiryStatus(
  id,
  status
) {

  try {

    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/contact_inquiries?id=eq.${encodeURIComponent(
          id
        )}`,

        {
          method:
            "PATCH",

          headers: {

            apikey:
              SUPABASE_PUBLISHABLE_KEY,

            Authorization:
              `Bearer ${accessToken}`,

            "Content-Type":
              "application/json",

            Prefer:
              "return=minimal"

          },

          body:
            JSON.stringify({
              status
            })
        }

      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );
    }


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

    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/contact_inquiries?id=eq.${encodeURIComponent(
          id
        )}`,

        {
          method:
            "DELETE",

          headers: {

            apikey:
              SUPABASE_PUBLISHABLE_KEY,

            Authorization:
              `Bearer ${accessToken}`

          }
        }

      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );
    }


    showMessage(
      inquiryActionMessage,
      "Inquiry deleted."
    );


    await loadInquiryCounts();

    await loadInquiries();


  } catch (error) {

    console.error(
      error
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

    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/reviews?select=id,status`,

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

      throw new Error(
        await response.text()
      );
    }


    const reviews =
      await response.json();


    if (pendingCount) {

      pendingCount.textContent =
        reviews.filter(
          review =>
            review.status ===
            "pending"
        ).length;
    }


    if (approvedCount) {

      approvedCount.textContent =
        reviews.filter(
          review =>
            review.status ===
            "approved"
        ).length;
    }


    if (rejectedCount) {

      rejectedCount.textContent =
        reviews.filter(
          review =>
            review.status ===
            "rejected"
        ).length;
    }


  } catch (error) {

    console.error(
      "Review count error:",
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

    `${SUPABASE_URL}/rest/v1/reviews` +

    `?select=id,name,business,rating,text,status,created_at` +

    `&order=created_at.desc`;


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

    const response =
      await fetch(

        endpoint,

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

      throw new Error(
        await response.text()
      );
    }


    const reviews =
      await response.json();


    renderReviews(
      reviews
    );


  } catch (error) {

    console.error(
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
    reviews.map(
      review => `

        <article class="admin-review-card">

          <div class="admin-review-top">

            <div>

              <div class="stars">

                ${"★".repeat(

                  Math.max(
                    1,
                    Math.min(
                      5,
                      Number(
                        review.rating
                      )
                    )
                  )

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

      `
    ).join("");


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

    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/reviews?id=eq.${encodeURIComponent(
          id
        )}`,

        {
          method:
            "PATCH",

          headers: {

            apikey:
              SUPABASE_PUBLISHABLE_KEY,

            Authorization:
              `Bearer ${accessToken}`,

            "Content-Type":
              "application/json",

            Prefer:
              "return=minimal"

          },

          body:
            JSON.stringify({
              status
            })
        }

      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );
    }


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
      error
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

    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/reviews?id=eq.${encodeURIComponent(
          id
        )}`,

        {
          method:
            "DELETE",

          headers: {

            apikey:
              SUPABASE_PUBLISHABLE_KEY,

            Authorization:
              `Bearer ${accessToken}`

          }
        }

      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );
    }


    showMessage(
      actionMessage,
      "Review deleted."
    );


    await loadReviewCounts();

    await loadReviews();


  } catch (error) {

    console.error(
      error
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
// ADMIN PRICING API
// =====================================================

async function pricingAdminRequest(
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

    throw new Error(
      await response.text()
    );
  }


  const text =
    await response.text();


  return text
    ? JSON.parse(text)
    : null;

}


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
    3000
  );

}


// =====================================================
// LOAD PRICING
// =====================================================

async function loadAdminPricing() {

  await Promise.allSettled([

    loadAdminServicePricing(),

    loadAdminRegionPricing()

  ]);


  await loadAdminOverrides();

}


// =====================================================
// LOAD SERVICE PRICES
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
      await pricingAdminRequest(

        "services_pricing?" +

        "select=id,service_code,service_name,base_price_cad,price_type,active" +

        "&order=id.asc"

      );


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
// RENDER SERVICE PRICES
// =====================================================

function renderAdminServicePricing() {

  if (!adminServicePricing) {
    return;
  }


  adminServicePricing.innerHTML =
    adminPricingServices.map(
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
            Base Price (CAD)
          </label>


          <input
            type="number"
            min="0"
            step="0.01"
            value="${Number(
              service.base_price_cad
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
    ).join("");


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
// SAVE SERVICE PRICE
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
    !Number.isFinite(price) ||
    price < 0
  ) {

    showPricingMessage(
      "Enter a valid price."
    );

    return;
  }


  button.disabled =
    true;

  button.textContent =
    "Saving...";


  try {

    await pricingAdminRequest(

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

            base_price_cad:
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
      "Service price updated."
    );


    await loadAdminServicePricing();


  } catch (error) {

    console.error(
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
// LOAD COUNTRIES
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
      await pricingAdminRequest(

        "pricing_regions?" +

        "select=country_code,country_name,currency_code,currency_symbol,multiplier,active" +

        "&order=country_name.asc"

      );


    renderAdminRegions();


    populateOverrideCountries();


  } catch (error) {

    console.error(
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
// RENDER COUNTRIES
// =====================================================

function renderAdminRegions() {

  if (!adminRegionPricing) {
    return;
  }


  adminRegionPricing.innerHTML =
    adminPricingRegions.map(
      region => `

        <article
          class="pricing-region-row"
        >

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
              data-region-currency="${region.country_code}"
            >

          </div>


          <div>

            <label>
              Symbol
            </label>

            <input
              type="text"
              maxlength="6"
              value="${escapeHtml(
                region.currency_symbol
              )}"
              data-region-symbol="${region.country_code}"
            >

          </div>


          <div>

            <label>
              Multiplier
            </label>

            <input
              type="number"
              min="0.0001"
              step="0.0001"
              value="${Number(
                region.multiplier
              )}"
              data-region-multiplier="${region.country_code}"
            >

          </div>


          <button
            class="btn"
            type="button"
            data-save-region="${region.country_code}"
          >
            Save
          </button>

        </article>

      `
    ).join("");


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
// SAVE REGION
// =====================================================

async function saveAdminRegion(
  event
) {

  const button =
    event.currentTarget;


  const code =
    button.dataset.saveRegion;


  const currency =
    document.querySelector(
      `[data-region-currency="${code}"]`
    );


  const symbol =
    document.querySelector(
      `[data-region-symbol="${code}"]`
    );


  const multiplier =
    document.querySelector(
      `[data-region-multiplier="${code}"]`
    );


  if (
    !currency ||
    !symbol ||
    !multiplier
  ) {

    return;
  }


  const multiplierNumber =
    Number(
      multiplier.value
    );


  if (
    !Number.isFinite(
      multiplierNumber
    ) ||
    multiplierNumber <= 0
  ) {

    showPricingMessage(
      "Multiplier must be greater than zero."
    );

    return;
  }


  button.disabled =
    true;

  button.textContent =
    "Saving...";


  try {

    await pricingAdminRequest(

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
              currency.value
                .trim()
                .toUpperCase(),

            currency_symbol:
              symbol.value
                .trim(),

            multiplier:
              multiplierNumber,

            updated_at:
              new Date()
                .toISOString()

          })
      }

    );


    showPricingMessage(
      `${code} pricing updated.`
    );


  } catch (error) {

    console.error(
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
// POPULATE OVERRIDE SERVICE SELECT
// =====================================================

function populateOverrideServices() {

  if (!overrideService) {
    return;
  }


  overrideService.innerHTML =
    adminPricingServices.map(
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
    ).join("");

}


// =====================================================
// POPULATE COUNTRY SELECT
// =====================================================

function populateOverrideCountries() {

  if (!overrideCountry) {
    return;
  }


  overrideCountry.innerHTML =
    adminPricingRegions.map(
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
    ).join("");

}


// =====================================================
// SAVE COUNTRY OVERRIDE
// =====================================================

saveOverrideButton?.addEventListener(
  "click",
  async () => {

    const serviceCode =
      overrideService?.value;


    const countryCode =
      overrideCountry?.value;


    const price =
      Number(
        overridePrice?.value
      );


    if (
      !serviceCode ||
      !countryCode ||
      !Number.isFinite(price) ||
      price < 0
    ) {

      showPricingMessage(
        "Enter a valid override price."
      );

      return;
    }


    saveOverrideButton.disabled =
      true;

    saveOverrideButton.textContent =
      "Saving...";


    try {

      await pricingAdminRequest(

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
// LOAD OVERRIDES
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
      await pricingAdminRequest(

        "pricing_overrides?" +

        "select=id,service_code,country_code,local_price,updated_at" +

        "&order=country_code.asc"

      );


    renderAdminOverrides(
      overrides ||
      []
    );


  } catch (error) {

    console.error(
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
    overrides.map(
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

          <article
            class="pricing-override-row"
          >

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
    ).join("");


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
// DELETE OVERRIDE
// =====================================================

async function deletePricingOverride(
  event
) {

  const button =
    event.currentTarget;


  const id =
    button.dataset.deleteOverride;


  if (
    !window.confirm(
      "Delete this country-specific price?"
    )
  ) {

    return;
  }


  try {

    await pricingAdminRequest(

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
      error
    );


    showPricingMessage(
      "Unable to delete price override."
    );

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
        "Logout error:",
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


    loginForm?.reset();

  }
);


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
// RESTORE SESSION
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


  const validToken =
    await tokenIsValid();


  if (!validToken) {

    sessionStorage.removeItem(
      "doanaAdminToken"
    );

    accessToken =
      null;

    return;
  }


  const isAdmin =
    await verifyAdmin();


  if (!isAdmin) {

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