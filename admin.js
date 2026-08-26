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


const analyticsPanel =
  document.getElementById("analyticsPanel");

const inquiriesPanel =
  document.getElementById("inquiriesPanel");

const reviewsPanel =
  document.getElementById("reviewsPanel");


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
// INQUIRY DOM
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
// REVIEW DOM
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
// STATE
// =====================================================

let accessToken = null;

let currentInquiryFilter =
  "new";

let currentReviewFilter =
  "pending";


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

  element.textContent = "";

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

  if (!value) return "";

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
          .getElementById(
            "adminEmail"
          )
          .value
          .trim();


      const password =
        document
          .getElementById(
            "adminPassword"
          )
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


        const isAdmin =
          await verifyAdmin();


        if (!isAdmin) {

          accessToken = null;

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

if (forgotPasswordButton) {

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
          .getElementById(
            "adminEmail"
          )
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


  await Promise.allSettled([
    loadInquiryCounts(),
    loadReviewCounts()
  ]);


  showAdminPanel(
    "analytics"
  );
}


// =====================================================
// MAIN TAB SYSTEM
// =====================================================

function showAdminPanel(
  selectedPanel
) {

  const tabs = [
    analyticsTab,
    inquiriesTab,
    reviewsTab
  ];


  const panels = [
    analyticsPanel,
    inquiriesPanel,
    reviewsPanel
  ];


  tabs.forEach(
    tab => {

      if (tab) {
        tab.classList.remove(
          "active"
        );
      }

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


  if (
    selectedPanel ===
    "analytics"
  ) {

    analyticsTab?.classList.add(
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

    inquiriesTab?.classList.add(
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

    reviewsTab?.classList.add(
      "active"
    );

    if (reviewsPanel) {

      reviewsPanel.style.display =
        "block";

    }

    loadReviews();

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


// =====================================================
// ANALYTICS
// =====================================================

async function loadAnalytics() {

  if (!accessToken) {
    return;
  }


  setAnalyticsLoading();


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

      const errorText =
        await response.text();

      throw new Error(
        errorText
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


    setAnalyticsError();

  }
}


function setAnalyticsLoading() {

  [
    totalPageViews,
    uniqueVisitors,
    todayViews,
    weekViews
  ].forEach(
    element => {

      if (element) {
        element.textContent =
          "…";
      }

    }
  );


  if (topPages) {
    topPages.innerHTML =
      `<p class="note">Loading...</p>`;
  }


  if (countryAnalytics) {
    countryAnalytics.innerHTML =
      `<p class="note">Loading...</p>`;
  }


  if (trafficSources) {
    trafficSources.innerHTML =
      `<p class="note">Loading...</p>`;
  }


  if (recentVisits) {
    recentVisits.innerHTML =
      `<p class="note">Loading...</p>`;
  }
}


function setAnalyticsError() {

  [
    totalPageViews,
    uniqueVisitors,
    todayViews,
    weekViews
  ].forEach(
    element => {

      if (element) {
        element.textContent =
          "—";
      }

    }
  );


  const errorMessage = `
    <p class="note">
      Unable to load analytics.
      Check the browser console and Supabase permissions.
    </p>
  `;


  if (topPages) {
    topPages.innerHTML =
      errorMessage;
  }


  if (countryAnalytics) {
    countryAnalytics.innerHTML =
      errorMessage;
  }


  if (trafficSources) {
    trafficSources.innerHTML =
      errorMessage;
  }


  if (recentVisits) {
    recentVisits.innerHTML =
      errorMessage;
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
          ) &&
          date >= todayStart
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
    sevenDaysAgo.getDate() - 7
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
          ) &&
          date >= sevenDaysAgo
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

  if (!topPages) return;


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
    sorted
      .map(
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
      )
      .join("");
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

          count:
            0,

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


  if (!sorted.length) {

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
    sorted
      .map(
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

                  ${data.count.toLocaleString()}

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
// TRAFFIC SOURCES
// =====================================================

function renderTrafficSources(
  views
) {

  if (!trafficSources) return;


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
        No traffic source data yet.
      </p>
    `;

    return;
  }


  trafficSources.innerHTML =
    sorted
      .map(
        ([source,count]) => `

          <div class="analytics-row">

            <span>
              ${escapeHtml(source)}
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
    inquiries
      .map(
        inquiry => `

          <article
            class="admin-inquiry-card"
          >

            <div
              class="admin-inquiry-top"
            >

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



            <div
              class="admin-inquiry-details"
            >


              <div
                class="admin-inquiry-field"
              >

                <strong>
                  Business
                </strong>

                ${escapeHtml(
                  inquiry.business ||
                  "—"
                )}

              </div>



              <div
                class="admin-inquiry-field"
              >

                <strong>
                  Phone
                </strong>

                ${
                  inquiry.phone

                    ? `

                      <a
                        href="tel:${escapeHtml(
                          inquiry.phone
                        )}"
                      >
                        ${escapeHtml(
                          inquiry.phone
                        )}
                      </a>

                    `

                    : "—"
                }

              </div>



              <div
                class="admin-inquiry-field"
              >

                <strong>
                  Service
                </strong>

                ${escapeHtml(
                  inquiry.service ||
                  "—"
                )}

              </div>



              <div
                class="admin-inquiry-field"
              >

                <strong>
                  Budget
                </strong>

                ${escapeHtml(
                  inquiry.budget ||
                  "—"
                )}

              </div>



              <div
                class="admin-inquiry-field"
              >

                <strong>
                  Timeline
                </strong>

                ${escapeHtml(
                  inquiry.timeline ||
                  "—"
                )}

              </div>



              <div
                class="admin-inquiry-field"
              >

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



            <div
              class="admin-inquiry-message"
            >

              <strong>
                Project details
              </strong>

              <p>
                ${escapeHtml(
                  inquiry.message
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
                )}?subject=${encodeURIComponent(
                  `Re: Your Doana Digital ${
                    inquiry.service ||
                    "project"
                  } inquiry`
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
// INQUIRY ACTIONS
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

    const confirmed =
      window.confirm(
        "Delete this inquiry permanently?"
      );


    if (!confirmed) {
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

  hideMessage(
    inquiryActionMessage
  );


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
      "Inquiry update error:",
      error
    );


    showMessage(
      inquiryActionMessage,
      "Unable to update this inquiry."
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
      "Inquiry delete error:",
      error
    );


    showMessage(
      inquiryActionMessage,
      "Unable to delete this inquiry."
    );

  }
}


// =====================================================
// INQUIRY FILTER EVENTS
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
      "Unable to load reviews:",
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
        review => `

          <article
            class="admin-review-card"
          >

            <div
              class="admin-review-top"
            >

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

              Submitted:

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
                      type="button"
                      class="btn"
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
                      type="button"
                      class="btn"
                      data-review-action="reject"
                      data-review-id="${review.id}"
                    >
                      Reject
                    </button>

                  `

                  : ""
              }


              <button
                type="button"
                class="btn admin-delete"
                data-review-action="delete"
                data-review-id="${review.id}"
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

    const confirmed =
      window.confirm(
        "Delete this review permanently?"
      );


    if (!confirmed) {
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
      "Review update error:",
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
      "Review delete error:",
      error
    );


    showMessage(
      actionMessage,
      "Unable to delete review."
    );

  }
}


// =====================================================
// REVIEW FILTER EVENTS
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
// RESTORE LOGIN
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