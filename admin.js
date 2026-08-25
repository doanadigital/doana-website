// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL =
  "https://efbmmxtteekbjayiesft.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_xBSJ2JvLfmitO7-e-JJHpw_Ak3R7joj";


// ========================================
// ELEMENTS
// ========================================

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

const logoutButton =
  document.getElementById("adminLogout");

const reviewList =
  document.getElementById("adminReviewList");

const filterButtons =
  document.querySelectorAll(".admin-filter");


let accessToken = null;
let currentFilter = "pending";


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const email =
      document
        .getElementById("adminEmail")
        .value
        .trim();


    const password =
      document
        .getElementById("adminPassword")
        .value;


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


      if (!response.ok) {

        throw new Error(
          result.error_description ||
          result.msg ||
          "Login failed"
        );

      }


      accessToken =
        result.access_token;


      sessionStorage.setItem(
        "doanaAdminToken",
        accessToken
      );


      showDashboard();


    } catch (error) {

      loginMessage.style.display =
        "block";

      loginMessage.textContent =
        "Invalid email or password.";

    } finally {

      loginButton.disabled =
        false;

      loginButton.textContent =
        "Sign In";

    }

  }
);


// ========================================
// DASHBOARD
// ========================================

function showDashboard() {

  loginSection.style.display =
    "none";

  dashboard.style.display =
    "block";

  loadReviews();

}


// ========================================
// LOAD REVIEWS
// ========================================

async function loadReviews() {

  if (!accessToken) return;


  reviewList.innerHTML =
    `<p class="note">Loading reviews...</p>`;


  let endpoint =
    `${SUPABASE_URL}/rest/v1/reviews` +
    `?select=*` +
    `&order=created_at.desc`;


  if (currentFilter !== "all") {

    endpoint +=
      `&status=eq.${currentFilter}`;

  }


  try {

    const response =
      await fetch(
        endpoint,
        {

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
        "Unable to load reviews"
      );

    }


    const reviews =
      await response.json();


    renderAdminReviews(
      reviews
    );


  } catch (error) {

    reviewList.innerHTML =
      `<p class="note">
        Unable to load reviews.
      </p>`;

  }

}


// ========================================
// RENDER
// ========================================

function renderAdminReviews(
  reviews
) {

  if (!reviews.length) {

    reviewList.innerHTML =
      `<p class="note">
        No reviews found.
      </p>`;

    return;

  }


  reviewList.innerHTML =
    reviews
      .map(
        review => `

          <article
            class="admin-review-card"
          >

            <div class="admin-review-top">

              <div>

                <div class="stars">
                  ${"★".repeat(
                    Number(review.rating)
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
                class="admin-status
                status-${review.status}"
              >
                ${review.status}
              </span>

            </div>


            <p>
              “${escapeHtml(
                review.text
              )}”
            </p>


            <p class="note">
              Submitted:
              ${new Date(
                review.created_at
              ).toLocaleString()}
            </p>


            <div
              class="admin-actions"
            >

              <button
                type="button"
                class="btn"
                data-review-action="approve"
                data-review-id="${review.id}"
              >
                Approve
              </button>


              <button
                type="button"
                class="btn"
                data-review-action="reject"
                data-review-id="${review.id}"
              >
                Reject
              </button>


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


// ========================================
// REVIEW ACTIONS
// ========================================

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
    action === "delete"
  ) {

    const confirmed =
      confirm(
        "Delete this review permanently?"
      );


    if (!confirmed) return;


    await deleteReview(
      id
    );


    return;

  }


  const status =
    action === "approve"
      ? "approved"
      : "rejected";


  await updateReviewStatus(
    id,
    status
  );

}


// ========================================
// UPDATE STATUS
// ========================================

async function updateReviewStatus(
  id,
  status
) {

  try {

    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/reviews?id=eq.${id}`,
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
        "Unable to update review"
      );

    }


    loadReviews();


  } catch (error) {

    alert(
      "Unable to update review."
    );

  }

}


// ========================================
// DELETE
// ========================================

async function deleteReview(
  id
) {

  try {

    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/reviews?id=eq.${id}`,
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
        "Unable to delete review"
      );

    }


    loadReviews();


  } catch (error) {

    alert(
      "Unable to delete review."
    );

  }

}


// ========================================
// FILTERS
// ========================================

filterButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        filterButtons.forEach(
          b =>
            b.classList.remove(
              "active"
            )
        );


        button.classList.add(
          "active"
        );


        currentFilter =
          button.dataset.status;


        loadReviews();

      }
    );

  }
);


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
  "click",
  () => {

    sessionStorage.removeItem(
      "doanaAdminToken"
    );


    accessToken = null;


    dashboard.style.display =
      "none";


    loginSection.style.display =
      "block";

  }
);


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,

    char => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    })[char]
  );

}


// ========================================
// RESTORE SESSION
// ========================================

const storedToken =
  sessionStorage.getItem(
    "doanaAdminToken"
  );


if (storedToken) {

  accessToken =
    storedToken;


  showDashboard();

}