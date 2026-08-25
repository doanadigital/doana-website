// =====================================================
// DOANA DIGITAL - ADMIN DASHBOARD
// =====================================================


// =====================================================
// 1. SUPABASE CONFIGURATION
// =====================================================

const SUPABASE_URL =
  "https://efbmmxtteekbjayiesft.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";


// This automatically creates the correct reset URL
// whether you're running locally or on GitHub Pages.

const PASSWORD_RESET_URL =
  new URL(
    "reset-password.html",
    window.location.href
  ).href;



// =====================================================
// 2. PAGE ELEMENTS
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

const filterButtons =
  document.querySelectorAll(".admin-filter");



// =====================================================
// 3. ADMIN STATE
// =====================================================

let accessToken = null;

let currentFilter = "pending";



// =====================================================
// 4. MESSAGE HELPERS
// =====================================================

function showMessage(element, message) {

  if (!element) {
    return;
  }

  element.textContent = message;

  element.style.display = "block";
}


function hideMessage(element) {

  if (!element) {
    return;
  }

  element.textContent = "";

  element.style.display = "none";
}



// =====================================================
// 5. HTML ESCAPING
// =====================================================

function escapeHtml(value) {

  return String(value ?? "").replace(
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



// =====================================================
// 6. DATE FORMAT
// =====================================================

function formatDate(value) {

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
// 7. LOGIN
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

        // -----------------------------------------
        // AUTHENTICATE WITH SUPABASE
        // -----------------------------------------

        const response =
          await fetch(
            `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
            {
              method: "POST",

              headers: {
                "apikey":
                  SUPABASE_ANON_KEY,

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

          console.error(
            "Supabase login error:",
            result
          );

          throw new Error(
            "LOGIN_FAILED"
          );
        }


        accessToken =
          result.access_token;


        // -----------------------------------------
        // VERIFY THIS USER IS ACTUALLY AN ADMIN
        // -----------------------------------------

        const isAdmin =
          await verifyAdmin();


        if (!isAdmin) {

          accessToken = null;

          throw new Error(
            "NOT_ADMIN"
          );
        }


        // -----------------------------------------
        // SAVE SESSION
        // -----------------------------------------

        sessionStorage.setItem(
          "doanaAdminToken",
          accessToken
        );


        // -----------------------------------------
        // OPEN DASHBOARD
        // -----------------------------------------

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
// 8. VERIFY ADMIN ACCOUNT
// =====================================================

async function verifyAdmin() {

  if (!accessToken) {
    return false;
  }


  try {

    /*
      Because your RLS policy only allows a user
      to see their own row in admin_users,
      getting one row means they are an admin.
    */

    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/admin_users?select=user_id`,
        {
          method: "GET",

          headers: {
            "apikey":
              SUPABASE_ANON_KEY,

            "Authorization":
              `Bearer ${accessToken}`,

            "Accept":
              "application/json"
          }
        }
      );


    if (!response.ok) {

      console.error(
        "Admin verification HTTP error:",
        response.status,
        await response.text()
      );

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
// 9. FORGOT PASSWORD
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
          "Enter your admin email first, then click Forgot password."
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
                "apikey":
                  SUPABASE_ANON_KEY,

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

          const errorText =
            await response.text();

          console.error(
            "Recovery error:",
            errorText
          );

          throw new Error(
            "RESET_FAILED"
          );
        }


        showMessage(
          resetMessage,
          "If this email belongs to the admin account, a password reset link has been sent. Check your inbox and spam folder."
        );


      } catch (error) {

        console.error(
          "Password reset error:",
          error
        );


        showMessage(
          resetMessage,
          "Unable to send the password reset email right now. Please try again."
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
// 10. SHOW DASHBOARD
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


  await loadCounts();

  await loadReviews();

}



// =====================================================
// 11. LOAD REVIEW COUNTS
// =====================================================

async function loadCounts() {

  if (!accessToken) {
    return;
  }


  try {

    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/reviews?select=id,status`,
        {
          method: "GET",

          headers: {
            "apikey":
              SUPABASE_ANON_KEY,

            "Authorization":
              `Bearer ${accessToken}`,

            "Accept":
              "application/json"
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


    const pending =
      reviews.filter(
        review =>
          review.status ===
          "pending"
      ).length;


    const approved =
      reviews.filter(
        review =>
          review.status ===
          "approved"
      ).length;


    const rejected =
      reviews.filter(
        review =>
          review.status ===
          "rejected"
      ).length;


    if (pendingCount) {

      pendingCount.textContent =
        pending;

    }


    if (approvedCount) {

      approvedCount.textContent =
        approved;

    }


    if (rejectedCount) {

      rejectedCount.textContent =
        rejected;

    }


  } catch (error) {

    console.error(
      "Unable to load review counts:",
      error
    );

  }

}



// =====================================================
// 12. LOAD REVIEWS
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
    currentFilter !==
    "all"
  ) {

    endpoint +=
      `&status=eq.${encodeURIComponent(
        currentFilter
      )}`;

  }


  try {

    const response =
      await fetch(
        endpoint,
        {
          method: "GET",

          headers: {
            "apikey":
              SUPABASE_ANON_KEY,

            "Authorization":
              `Bearer ${accessToken}`,

            "Accept":
              "application/json"
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


    renderAdminReviews(
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
// 13. RENDER ADMIN REVIEWS
// =====================================================

function renderAdminReviews(
  reviews
) {

  if (!reviewList) {
    return;
  }


  if (
    !Array.isArray(reviews) ||
    reviews.length === 0
  ) {

    reviewList.innerHTML = `
      <p class="note">
        No ${escapeHtml(
          currentFilter
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
                ) || 1
              )
            );


          const status =
            review.status ||
            "pending";


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
                      status
                    )}
                  "
                >
                  ${escapeHtml(
                    status
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
                  status !==
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
                  status !==
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
// 14. HANDLE REVIEW ACTION
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


  if (
    action ===
    "approve"
  ) {

    await updateReviewStatus(
      id,
      "approved"
    );

    return;
  }


  if (
    action ===
    "reject"
  ) {

    await updateReviewStatus(
      id,
      "rejected"
    );

  }

}



// =====================================================
// 15. APPROVE / REJECT REVIEW
// =====================================================

async function updateReviewStatus(
  id,
  status
) {

  hideMessage(
    actionMessage
  );


  try {

    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/reviews?id=eq.${encodeURIComponent(
          id
        )}`,
        {
          method: "PATCH",

          headers: {
            "apikey":
              SUPABASE_ANON_KEY,

            "Authorization":
              `Bearer ${accessToken}`,

            "Content-Type":
              "application/json",

            "Prefer":
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
      status === "approved"
        ? "Review approved successfully."
        : "Review rejected successfully."
    );


    await loadCounts();

    await loadReviews();


  } catch (error) {

    console.error(
      "Review update error:",
      error
    );


    showMessage(
      actionMessage,
      "Unable to update this review."
    );

  }

}



// =====================================================
// 16. DELETE REVIEW
// =====================================================

async function deleteReview(
  id
) {

  hideMessage(
    actionMessage
  );


  try {

    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/reviews?id=eq.${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",

          headers: {
            "apikey":
              SUPABASE_ANON_KEY,

            "Authorization":
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
      "Review deleted successfully."
    );


    await loadCounts();

    await loadReviews();


  } catch (error) {

    console.error(
      "Review delete error:",
      error
    );


    showMessage(
      actionMessage,
      "Unable to delete this review."
    );

  }

}



// =====================================================
// 17. FILTER BUTTONS
// =====================================================

filterButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      async () => {

        filterButtons.forEach(
          item =>
            item.classList.remove(
              "active"
            )
        );


        button.classList.add(
          "active"
        );


        currentFilter =
          button.dataset.status ||
          "pending";


        await loadReviews();

      }
    );

  }
);



// =====================================================
// 18. LOGOUT
// =====================================================

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async () => {

      try {

        if (accessToken) {

          await fetch(
            `${SUPABASE_URL}/auth/v1/logout`,
            {
              method: "POST",

              headers: {
                "apikey":
                  SUPABASE_ANON_KEY,

                "Authorization":
                  `Bearer ${accessToken}`
              }
            }
          );

        }

      } catch (error) {

        console.warn(
          "Supabase logout warning:",
          error
        );

      }


      sessionStorage.removeItem(
        "doanaAdminToken"
      );


      accessToken = null;


      if (dashboard) {

        dashboard.style.display =
          "none";

      }


      if (loginSection) {

        loginSection.style.display =
          "block";

      }


      if (loginForm) {

        loginForm.reset();

      }


      hideMessage(
        loginMessage
      );

      hideMessage(
        resetMessage
      );

      hideMessage(
        actionMessage
      );

  });

}



// =====================================================
// 19. CHECK TOKEN IS STILL VALID
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
          method: "GET",

          headers: {
            "apikey":
              SUPABASE_ANON_KEY,

            "Authorization":
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
// 20. RESTORE ADMIN SESSION
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

    accessToken = null;

    return;
  }


  const isAdmin =
    await verifyAdmin();


  if (!isAdmin) {

    sessionStorage.removeItem(
      "doanaAdminToken"
    );

    accessToken = null;

    return;
  }


  await showDashboard();

}



// =====================================================
// 21. START
// =====================================================

restoreAdminSession();